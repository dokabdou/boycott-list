package com.example.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;

@Document(collection = "posts")
@Data
public class Post {
    @Id
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String id;

    private String companyName;
    private String description;
    private List<String> sourceLinks;        // mandatory links to sources
    private List<String> tags;               // e.g. ["environment", "labor"]
    private List<List<String>> highlights;   // up to 3 boxes, each with up to 4 items

    private String submittedBy;              // anonymous or admin username
    private boolean anonymous;               // true if submitted anonymously

    private PostStatus status;               // PENDING, APPROVED, REJECTED
    private Instant createdAt;
    private Instant reviewedAt;
    private String reviewedBy;               // admin who reviewed

    public enum PostStatus {
        PENDING, APPROVED, REJECTED
    }

	public String info() {
		return "Post{" +
				"id='" + id + '\'' +
				", companyName='" + companyName + '\'' +
				", description='" + description + '\'' +
				", sourceLinks=" + sourceLinks +
				", tags=" + tags +
				", highlights=" + highlights +
				", submittedBy='" + submittedBy + '\'' +
				", anonymous=" + anonymous +
				", status=" + status +
				", createdAt=" + createdAt +
				", reviewedAt=" + reviewedAt +
				", reviewedBy='" + reviewedBy + '\'' +
				'}';
	}
}