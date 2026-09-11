package com.example.staycontrol.controller.api;

import com.example.staycontrol.dto.LoginRequest;
import com.example.staycontrol.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    public record UsuarioResponse(String email) { }
    public record CsrfResponse(String headerName, String token) { }
    private final AuthService service;
    public AuthController(AuthService service) { this.service = service; }

    @GetMapping("/csrf")
    public CsrfResponse csrf(CsrfToken csrf) { return new CsrfResponse(csrf.getHeaderName(), csrf.getToken()); }

    @PostMapping("/login")
    public UsuarioResponse login(@RequestBody LoginRequest datos, HttpServletRequest request, HttpServletResponse response) {
        return new UsuarioResponse(service.login(datos, request, response));
    }

    @GetMapping("/me")
    public UsuarioResponse me(Authentication authentication) { return new UsuarioResponse(authentication.getName()); }
    // POST /logout lo procesa Spring Security: invalida sesión, contexto y cookie.
}
