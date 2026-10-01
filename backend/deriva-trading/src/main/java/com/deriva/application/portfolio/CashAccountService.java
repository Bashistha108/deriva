package com.deriva.application.portfolio;

import com.deriva.domain.portfolio.CashAccount;
import com.deriva.persistence.portfolio.CashAccountRepository;
import com.deriva.persistence.portfolio.CashTransactionRepository;
import com.deriva.domain.user.UserRegisteredEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class CashAccountService {

    private final CashAccountRepository cashAccountRepository;
    private final CashTransactionRepository cashTransactionRepository;

    public CashAccountService(CashAccountRepository cashAccountRepository, CashTransactionRepository cashTransactionRepository) {
        this.cashAccountRepository = cashAccountRepository;
        this.cashTransactionRepository = cashTransactionRepository;
    }

    @EventListener
    @Transactional
    public void onUserRegistered(UserRegisteredEvent event) {
        initializeAccount(event.getUserId());
    }

    @Transactional
    public void initializeAccount(UUID userId) {
        if (cashAccountRepository.findByUserId(userId).isPresent()) {
            return;
        }
        CashAccount account = new CashAccount();
        account.setUserId(userId);
        account.setCurrency("USD");
        account.setBalance(new BigDecimal("100000.00")); // default paper trading amount
        account.setReservedBalance(BigDecimal.ZERO);
        account.setCreatedAt(LocalDateTime.now());
        account.setUpdatedAt(LocalDateTime.now());
        cashAccountRepository.save(account);
    }

    @Transactional
    public void setBalance(UUID userId, BigDecimal amount) {
        CashAccount account = cashAccountRepository.findByUserId(userId).orElseGet(() -> {
            CashAccount acc = new CashAccount();
            acc.setUserId(userId);
            acc.setCurrency("USD");
            acc.setReservedBalance(BigDecimal.ZERO);
            acc.setCreatedAt(LocalDateTime.now());
            return acc;
        });
        
        account.setBalance(amount);
        account.setUpdatedAt(LocalDateTime.now());
        cashAccountRepository.save(account);
    }

    public Optional<CashAccount> getAccount(UUID userId) {
        return cashAccountRepository.findByUserId(userId);
    }

    @Transactional
    public void reserveFunds(UUID userId, BigDecimal amount) {
        CashAccount account = cashAccountRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalStateException("Cash account not found"));
            
        account.setReservedBalance(account.getReservedBalance().add(amount));
        account.setUpdatedAt(LocalDateTime.now());
        cashAccountRepository.save(account);
    }

    @Transactional
    public void settleTrade(UUID userId, BigDecimal amount, UUID tradeId) {
        CashAccount account = cashAccountRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalStateException("Cash account not found"));
            
        // amount is net change to balance (e.g. positive for sell credit, negative for buy debit)
        account.setBalance(account.getBalance().add(amount));
        account.setUpdatedAt(LocalDateTime.now());
        cashAccountRepository.save(account);
    }
}
