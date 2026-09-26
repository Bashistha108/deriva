package com.deriva.domain.portfolio;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CashAccountTest {

    @Test
    void testDepositIncreasesBalance() {
        CashAccount account = new CashAccount();
        account.setBalance(new BigDecimal("1000.00"));
        
        account.setBalance(account.getBalance().add(new BigDecimal("500.00")));
        
        assertThat(account.getBalance()).isEqualByComparingTo(new BigDecimal("1500.00"));
    }

    @Test
    void testWithdrawalDecreasesBalance() {
        CashAccount account = new CashAccount();
        account.setBalance(new BigDecimal("1000.00"));
        
        account.setBalance(account.getBalance().subtract(new BigDecimal("200.00")));
        
        assertThat(account.getBalance()).isEqualByComparingTo(new BigDecimal("800.00"));
    }
}
