package com.agroerp.demobackend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VendaDTO(
    Long id,
    LocalDateTime dataVenda,
    String nomePeca,
    Integer quantidade,
    BigDecimal valorTotal,
    String nomeVendedor
) {}