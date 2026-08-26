package com.example.backend.service;

import com.example.backend.model.HomeDescription;
import com.example.backend.repository.HomeDescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HomeDescriptionService {

    private final HomeDescriptionRepository homeDescriptionRepository;

    private static final String DEFAULT_DESCRIPTION =
        "<b>Welcome to The Boycott List! </b> <br>" +
        "I got this idea because I always see and hear about companies that are doing harm to the environment and or society. I sometimes forget which companies are on the list and why, so I created this simple tool to keep track of them. I will add the companies as I find them, and you can contribute as well! I provide information about companies that are engaging in unethical practices. <u>I also provide sources of course</u>. Some of the things on this list will be hard to boycott because we might not be able to properly live without them, so for those it will be about raising awareness. Ultimately, this website is mainly for me, to help me stay informed and make conscious choices.";

    @Transactional(readOnly = true)
    public String getHomeDescription() {
        return homeDescriptionRepository.findById(1L)
                .map(HomeDescription::getContent)
                .orElse(DEFAULT_DESCRIPTION);
    }

    @Transactional
    public String updateHomeDescription(String newContent) {
        HomeDescription desc = homeDescriptionRepository.findById(1L)
                .orElseGet(() -> new HomeDescription());
        desc.setId(1L);
        desc.setContent(newContent);
        homeDescriptionRepository.save(desc);
        return desc.getContent();
    }
}