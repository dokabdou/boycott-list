package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import java.util.Arrays;

@Configuration
public class MongoConfig {

    @Bean
    public MongoCustomConversions customConversions(
            CategoryReadConverter categoryReadConverter,
            PostTagReadConverter postTagReadConverter
    ) {
        return new MongoCustomConversions(
                Arrays.asList(categoryReadConverter, postTagReadConverter)
        );
    }
}