using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace backend.Models;

public class ServiceReport
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string ReportedBy { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;

    public string Complain { get; set; } = string.Empty;

    public string Details { get; set; } = string.Empty;

    public string CausesOfFailure { get; set; } = string.Empty;

    public string ActionTaken { get; set; } = string.Empty;
     public List<string>? ImagePaths { get; set; }

    public string CreatedBy { get; set; } = string.Empty;
    public string UpdatedBy { get; set; } = string.Empty;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
