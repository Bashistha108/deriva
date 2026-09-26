package com.deriva.application.user;

import com.deriva.domain.user.Role;
import com.deriva.domain.user.User;
import com.deriva.domain.user.UserPreference;
import com.deriva.persistence.user.UserPreferenceRepository;
import com.deriva.persistence.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, UserPreferenceRepository userPreferenceRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(String username, String email, String plainPassword) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(plainPassword));
        user.setRole(Role.USER);
        user.setEnabled(true);
        
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        user = userRepository.save(user);

        UserPreference pref = new UserPreference();
        pref.setUserId(user.getId());
        pref.setUser(user);
        pref.setBaseCurrency("USD");
        pref.setTimezone("Europe/Berlin");
        pref.setCreatedAt(now);
        pref.setUpdatedAt(now);

        userPreferenceRepository.save(pref);

        return user;
    }

    @Transactional
    public void updateLastLogin(UUID userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        });
    }
}
