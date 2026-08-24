package com.example.backend.model;

import com.example.backend.config.StringListConverter;
import com.example.backend.config.StringListListConverter;

import jakarta.persistence.*;
import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "posts")
@Data
@Schema(description = "Represents a post in the application.")
public class Post {

    @Id
    private String id;

    @Column(name = "company_name", nullable = false)
    @Schema(description = "The name of the company associated with the post.", example = "Spotify")
    private String companyName;

    @Column(name = "category_name")
    @Schema(description = "The category to which the post belongs.", example = "Music & Media")
    private String category;

    @Column(columnDefinition = "TEXT")
    @Schema(description = "A description of why this company should be boycotted.")
    private String description;

    @Column(name = "submitted_by")
    @Schema(description = "Anonymized username of the user who submitted.")
    private String submittedBy;

    @Column(name = "anonymous", nullable = false)
    private boolean anonymous;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "source_links", columnDefinition = "jsonb")
	@Convert(converter = StringListConverter.class)
	private List<String> sourceLinks;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "tags", columnDefinition = "jsonb")
	@Convert(converter = StringListConverter.class)
	private List<String> tags;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "highlights", columnDefinition = "jsonb")
	@Convert(converter = StringListListConverter.class)
	private List<List<String>> highlights;

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