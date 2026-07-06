package com.example.backend.config;

import com.example.backend.model.Category;
import org.bson.Document;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.stereotype.Component;

@Component
@ReadingConverter
public class CategoryReadConverter implements Converter<Document, Category> {
    @Override
    public Category convert(Document source) {
        Category category = new Category();
        category.setName(source.getString("name"));
        category.setApproved(source.getBoolean("approved", true));
        if (source.getObjectId("_id") != null) {
            category.setId(source.getObjectId("_id").toString());
        }
        return category;
    }
}