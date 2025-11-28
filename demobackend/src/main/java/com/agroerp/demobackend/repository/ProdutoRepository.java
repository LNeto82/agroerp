package com.agroerp.demobackend.repository;

import com.agroerp.demobackend.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    // Aqui ganhamos "de brinde": salvar, deletar, buscar todos...
}