package com.lpg.distribution.dto;

import jakarta.validation.constraints.NotNull;

public class AssignAgentDto {

    @NotNull(message = "Agent ID is required")
    private Integer agentId;

    public Integer getAgentId() { return agentId; }
    public void setAgentId(Integer agentId) { this.agentId = agentId; }
}
