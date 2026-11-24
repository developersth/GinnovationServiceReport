// Run with mongosh against the selected Ginnovation database.
const targetName = process.env.GINNOVATION_DATABASE
const applyChanges = process.env.GINNOVATION_APPLY_INDEXES === '1'

if (!targetName || targetName !== db.getName() || ['admin', 'config', 'local'].includes(targetName)) {
  throw new Error('Set GINNOVATION_DATABASE to the database selected in the mongosh connection string.')
}

const existingCollections = db.getCollectionNames()
const users = db.getCollection('Users')
const reports = db.getCollection('ServiceReports')
const projects = db.getCollection('Projects')
const expectedType = (field, bsonType) => ({ $eq: [{ $type: '$' + field }, bsonType] })
const unsupported = (collection, field, bsonType) =>
  collection.countDocuments({ $expr: { $not: [expectedType(field, bsonType)] } })

const invalidUsernames = users.countDocuments({
  $or: [
    { $expr: { $not: [expectedType('Username', 'string')] } },
    { Username: /^\s*$/ }
  ]
})
const duplicatedUsernames = users.aggregate([
  { $match: { $expr: expectedType('Username', 'string') } },
  { $group: { _id: '$Username', count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } },
  { $count: 'groups' }
], { allowDiskUse: true }).toArray()[0]?.groups ?? 0

const orphanedReports = reports.aggregate([
  { $project: { projectKey: { $convert: { input: '$ProjectId', to: 'objectId', onError: null, onNull: null } } } },
  { $lookup: { from: 'Projects', localField: 'projectKey', foreignField: '_id', as: 'project' } },
  { $match: { project: { $size: 0 } } },
  { $count: 'reports' }
], { allowDiskUse: true }).toArray()[0]?.reports ?? 0

printjson({
  database: targetName,
  mode: applyChanges ? 'apply' : 'dry run',
  audit: {
    invalidUsernames,
    duplicatedUsernames,
    incompatibleProjectIds: unsupported(projects, '_id', 'objectId'),
    incompatibleReportIds: unsupported(reports, '_id', 'objectId'),
    incompatibleReportProjectReferences: unsupported(reports, 'ProjectId', 'string'),
    incompatibleReportDates: unsupported(reports, 'ReportDate', 'date'),
    orphanedReports
  }
})

const proposed = [
  { collection: reports, key: { ProjectId: 1, ReportDate: -1, _id: -1 }, name: 'project_report_date_id' },
  { collection: reports, key: { ReportDate: -1, _id: -1 }, name: 'report_date_id' }
]

if (invalidUsernames === 0 && duplicatedUsernames === 0) {
  proposed.push({ collection: users, key: { Username: 1 }, name: 'username_unique', unique: true })
} else {
  print('Skipped username_unique. Resolve blank, non-string, or duplicate usernames before applying the unique index.')
}

for (const index of proposed) {
  const collectionName = index.collection.getName()
  const current = existingCollections.includes(collectionName) ? index.collection.getIndexes() : []
  const matchingKey = current.filter(item => JSON.stringify(item.key) === JSON.stringify(index.key))
  const equivalent = matchingKey.find(item =>
    item.unique === index.unique && !item.partialFilterExpression && !item.sparse && !item.hidden
  )

  if (equivalent) {
    print(`${collectionName}.${index.name} already covered by ${equivalent.name}`)
    continue
  }

  if (matchingKey.length > 0 || current.some(item => item.name === index.name)) {
    print(`${collectionName}.${index.name} conflicts with an existing index. Review its options before making changes.`)
    continue
  }

  print(`${collectionName}.${index.name} ${JSON.stringify(index.key)}`)
  if (applyChanges) {
    const options = { name: index.name }
    if (index.unique) options.unique = true
    print(index.collection.createIndex(index.key, options))
  }
}
