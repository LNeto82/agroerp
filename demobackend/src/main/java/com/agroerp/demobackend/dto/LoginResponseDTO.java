package com.agroerp.demobackend.dto;

public record LoginResponseDTO(String token, String role, String nome) {
}