package com.deriva.bootstrap.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class GlobalLoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(GlobalLoggingAspect.class);

    @Pointcut("execution(* com.deriva..*(..)) && " +
              "!execution(* com.deriva.api.filter.CorrelationIdFilter.*(..)) && " +
              "!execution(* com.deriva.api.security.JwtAuthenticationFilter.*(..)) && " +
              "!within(com.deriva.bootstrap.aspect..*) && " +
              "!within(org.springframework..*)")
    public void applicationPackagePointcut() {
        // Pointcut for all application methods
    }

    @Before("applicationPackagePointcut()")
    public void logMethodAccessBefore(JoinPoint joinPoint) {
        String packageName = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();
        logger.info("[Backend]{}.{}()", packageName, methodName);
    }
}
