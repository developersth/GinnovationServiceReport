using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models
{
    public class ServiceReport
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string ProjectId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ReportedBy { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Channel { get; set; } = string.Empty;

        [Required]
        public string Complain { get; set; } = string.Empty;

        public string Details { get; set; } = string.Empty;

        public string CausesOfFailure { get; set; } = string.Empty;

        public string ActionTaken { get; set; } = string.Empty;

        public List<string>? ImagePaths { get; set; }

        [Required]
        public DateTime ReportDate { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Open";

        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string UpdatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
