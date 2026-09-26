package com.deriva.persistence.portfolio;

import com.deriva.domain.portfolio.CashAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CashAccountRepository extends JpaRepository<CashAccount, UUID> {
    Optional<CashAccount> findByUserId(UUID userId);
}
