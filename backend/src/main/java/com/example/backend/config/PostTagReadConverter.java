package com.example.backend.config;

import com.example.backend.model.PostTag;
import org.bson.Document;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.stereotype.Component;

@Component
@ReadingConverter
public class PostTagReadConverter implements Converter<Document, PostTag> {
    @Override
    public PostTag convert(Document source) {
        PostTag tag = new PostTag();
        tag.setName(source.getString("name"));
        tag.setApproved(source.getBoolean("approved", true));
        if (source.getObjectId("_id") != null) {
            tag.setId(source.getObjectId("_id").toString());
        }
        return tag;
    }
}