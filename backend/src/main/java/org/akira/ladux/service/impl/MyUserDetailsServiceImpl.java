package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.model.User;
import org.akira.ladux.model.UserPrincipal;
import org.akira.ladux.repository.UserRepository;
import org.akira.ladux.service.MyUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Load user tu DB cho Spring Security — goi boi JwtFilter va AuthenticationManager khi login.
@RequiredArgsConstructor
@Service
public class MyUserDetailsServiceImpl implements MyUserDetailsService {
    private final UserRepository repo;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new UserPrincipal(user);
    }
}
