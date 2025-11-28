package com.agroerp.demobackend.dto;

import java.math.BigDecimal;

// O Record já cria getters, equals, hashCode e toString sozinho.
// É imutável (mais seguro, estilo SAP).
public record ProdutoDTO(
    Long id,
    String nome,
    String partNumber,
    String aplicacao,
    BigDecimal preco,
    Integer estoque
) {
}