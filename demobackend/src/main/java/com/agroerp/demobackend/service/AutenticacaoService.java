package com.agroerp.demobackend.service;

import com.agroerp.demobackend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AutenticacaoService implements UserDetailsService {

    @Autowired
    private UsuarioRepository repository;

    // Método que o Spring Security chama para buscar o usuário pelo login
    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        // Busca o usuário no banco de dados.
        // Se achar, ele devolve o objeto Usuario (que já é um UserDetails).
        // Se não achar, ele lança uma exceção que o AuthenticationManager pega.
        return repository.findByLogin(login)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário " + login + " não encontrado!"));
    }
}