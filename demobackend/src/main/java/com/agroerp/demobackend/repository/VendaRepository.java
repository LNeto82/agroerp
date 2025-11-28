package com.agroerp.demobackend.repository;

import com.agroerp.demobackend.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VendaRepository extends JpaRepository<Venda, Long> {
    
    // CORREÇÃO DEFINITIVA: 
    // O Spring Data entende que "Vendedor_Id" significa "vá na propriedade vendedor e pegue o id"
    List<Venda> findByVendedor_Id(Long id); 
}