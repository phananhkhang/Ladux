package org.akira.ladux.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import org.akira.ladux.exception.RateLimitExceededException;
import org.akira.ladux.service.DistributedRateLimitService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class EndpointRateLimitFilterTest {

    @Test
    void loginIsLimitedByClientIp() throws Exception {
        DistributedRateLimitService rateLimitService = mock(DistributedRateLimitService.class);
        EndpointRateLimitFilter filter = filter(rateLimitService);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.addHeader("X-Forwarded-For", "203.0.113.9");

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        verify(rateLimitService).check(
                "login-ip", "203.0.113.9", 5, 1,
                "Bạn đăng nhập quá nhiều, hãy thử lại sau"
        );
    }

    @Test
    void exceededLimitReturns429AndRetryAfter() throws Exception {
        DistributedRateLimitService rateLimitService = mock(DistributedRateLimitService.class);
        doThrow(new RateLimitExceededException("Too many", 12))
                .when(rateLimitService).check(anyString(), anyString(), org.mockito.ArgumentMatchers.anyInt(),
                        org.mockito.ArgumentMatchers.anyLong(), anyString());
        EndpointRateLimitFilter filter = filter(rateLimitService);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(
                new MockHttpServletRequest("POST", "/api/v1/auth/login"),
                response,
                new MockFilterChain()
        );

        assertEquals(429, response.getStatus());
        assertEquals("12", response.getHeader("Retry-After"));
    }

    private EndpointRateLimitFilter filter(DistributedRateLimitService service) {
        return new EndpointRateLimitFilter(
                service,
                5, 1,
                5, 1,
                3, 1,
                15, 1,
                5, 1,
                3, 1,
                60, 1
        );
    }
}
