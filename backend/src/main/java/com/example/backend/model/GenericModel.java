package com.example.backend.model;

public interface GenericModel {
    String getId();
    void setId(String id);
    String getName();
    void setName(String name);
    boolean isApproved();
    void setApproved(boolean approved);
}