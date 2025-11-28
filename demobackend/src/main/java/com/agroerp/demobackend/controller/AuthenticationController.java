package com.agroerp.demobackend.controller;

import com.agroerp.demobackend.dto.LoginDTO;
import com.agroerp.demobackend.dto.LoginResponseDTO; // ESTE É CRÍTICO!
import com.agroerp.demobackend.model.Usuario;
import com.agroerp.demobackend.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthenticationController {

    @Autowired private AuthenticationManager manager;
    @Autowired private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<?> efetuarLogin(@RequestBody LoginDTO dados) {
        try {
            var authenticationToken = new UsernamePasswordAuthenticationToken(dados.login(), dados.senha());
            var authentication = manager.authenticate(authenticationToken);

            Usuario usuario = (Usuario) authentication.getPrincipal();
            var tokenJWT = tokenService.gerarToken(usuario);

            // ⚠️ FIX: ESTA LINHA FORÇA O RETORNO JSON DO OBJETO DTO
            return ResponseEntity.ok(new LoginResponseDTO(tokenJWT, usuario.getPerfil(), usuario.getNome()));
            
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Acesso Negado: Usuário ou senha inválidos.");
        }
    }
}