package com.example.staycontrol.service;

import com.example.staycontrol.dto.LoginRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager manager;
    private final SecurityContextRepository contexts;
    private final SessionAuthenticationStrategy sessions;
    private final LoginAttemptLimiter limiter;

    public AuthService(AuthenticationManager manager, SecurityContextRepository contexts,
        SessionAuthenticationStrategy sessions, LoginAttemptLimiter limiter) {
        this.manager = manager;
        this.contexts = contexts;
        this.sessions = sessions;
        this.limiter = limiter;
    }

    public String login(LoginRequest datos, HttpServletRequest request, HttpServletResponse response) {
        limiter.comprobar(request.getRemoteAddr());
        datos.validar();
        var authentication = manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(
            LoginRequest.normalizarEmail(datos.email()), datos.password()));
        var anterior = SecurityContextHolder.getContext().getAuthentication();
        boolean mismaSesion = anterior != null && anterior.isAuthenticated()
            && !(anterior instanceof AnonymousAuthenticationToken)
            && anterior.getName().equals(authentication.getName());
        // Un reintento con la sesión ya autenticada no vuelve a rotar su identidad.
        if (!mismaSesion) { sessions.onAuthentication(authentication, request, response); }
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        contexts.saveContext(context, request, response);
        return authentication.getName();
    }
}
