package org.akira.ladux.service.impl;

import org.akira.ladux.model.User;
import org.akira.ladux.service.AuthenticationTokenService;
import org.akira.ladux.service.DeviceTokenService;
import org.akira.ladux.service.LoginAlertService;
import org.akira.ladux.service.LoginHistoryService;
import org.akira.ladux.service.LoginSuccessService;
import org.akira.ladux.utils.ClientIpUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginSuccessServiceImpl implements LoginSuccessService {

    private final AuthenticationTokenService authenticationTokenService;
    private final DeviceTokenService deviceTokenService;
    private final LoginHistoryService loginHistoryService;
    private final LoginAlertService loginAlertService;

    @Override
    @Transactional
    public CompletedLogin complete(User user, HttpServletRequest request, boolean mfaUsed) {
        DeviceTokenService.DeviceIdentity device = deviceTokenService.resolve(request);
        String ipAddress = ClientIpUtils.getClientIp(request);
        String userAgent = request == null ? null : request.getHeader("User-Agent");
        AuthenticationTokenService.IssuedAuthenticationTokens tokens = authenticationTokenService.issueAuthenticationTokens(user);
        LoginHistoryService.LoginHistoryResult history = loginHistoryService.recordSuccessfulLogin(
                user, ipAddress, device.hash(), userAgent, mfaUsed
        );
        if (history.newIp() || history.newDevice()) {
            loginAlertService.sendNewLoginAlert(user, ipAddress, userAgent, history.newIp(), history.newDevice());
        }
        return new CompletedLogin(
                tokens,
                device.tokenToSet() == null ? null : deviceTokenService.createCookie(device.tokenToSet())
        );
    }
}
