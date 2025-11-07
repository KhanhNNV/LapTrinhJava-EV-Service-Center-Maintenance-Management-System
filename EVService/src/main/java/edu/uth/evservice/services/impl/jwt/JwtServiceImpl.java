package edu.uth.evservice.services.impl.jwt;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.util.Date;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import org.springframework.stereotype.Service;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import edu.uth.evservice.models.CustomerUserDetails;
import edu.uth.evservice.services.jwt.IJwtService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements IJwtService {

    // . 3 biến này lấy ở thằng resources/application.properties
    @Value("${jwt.access-token.expiration-time}")
    private long accessTime;// ~KHOẢNG thời gian access tồn tại
    @Value("${jwt.refresh-token.expiration-time}")
    private long refeshTime;// ~KHOẢNG thời gian refesh tồn tại
    @Value("${app.key.secret}")
    private String keySecret;// ~Private key dành để kiểm tra xác thực

    // . Hàm "help" phân loại CustomerUserDetial từ Authentication
    private CustomerUserDetails getCustomerUserDetails(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomerUserDetails) {
            return (CustomerUserDetails) principal;
        } else {

            throw new IllegalStateException(
                    "Principal KHONG PHAI LA CustomerUserDetails, ma la: " + principal.getClass().getName());
        }
    }

    @Override
    // . Tạo chuỗi JWT Access Token
    public String generateAccessToken(Authentication authenication) {
        String scope = authenication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" ")); // ~ Một list danh danh sách quyền
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTime); // ~ THỜI GIAN HIỆN TẠI + KHOẢNG THỜI GIAN ACCESS TỒN
                                                                // TẠI
        CustomerUserDetails userDetails = getCustomerUserDetails(authenication);
        try {
            // ~ Tạo header + sử dụng thuật toán HS512
            JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

            // ~ Tạo payload: chứa những nội dung cần thiết
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(userDetails.getId().toString()) // ~id
                    .issueTime(now)
                    .expirationTime(expiryDate)
                    .claim("role", scope)
                    .claim("username", userDetails.getUsername())
                    .claim("email", userDetails.getUser().getEmail())
                    .claim("token_type", "access")
                    .build();
            // ~ Tạo đối tượng JWT chứa header + payload
            SignedJWT signedJWT = new SignedJWT(header, claimsSet);
            // ~ Tạo signature
            JWSSigner singer = new MACSigner(keySecret.getBytes());
            // ~ Ký lên JWT
            signedJWT.sign(singer);
            // ~ Chuyển thành Base64URL
            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    // . Tạo chuỗi JWT Access Token
    public String generateRefreshToken(Authentication authenication) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refeshTime); // ~ THỜI GIAN HIỆN TẠI + KHOẢNG THỜI GIAN ACCESS TỒN
                                                                // TẠI
        CustomerUserDetails userDetails = getCustomerUserDetails(authenication);
        try {
            // ~ Tạo header + sử dụng thuật toán HS512
            JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

            // ~ Tạo payload: chứa những nội dung cần thiết
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(userDetails.getId().toString()) // ~email
                    .issueTime(now)
                    .expirationTime(expiryDate)
                    .claim("token_type", "refresh")
                    .build();
            // ~ Tạo đối tượng JWT chứa header + payload
            SignedJWT signedJWT = new SignedJWT(header, claimsSet);
            // ~ Tạo signature
            JWSSigner singer = new MACSigner(keySecret.getBytes());
            // ~ Ký lên JWT
            signedJWT.sign(singer);
            // ~ Chuyển thành Base64URL
            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    // . Xác thực token còn có hiểu lực hay không
    public boolean verifyToken(String token) throws ParseException, JOSEException {
        // ~ Chuyển đổi chuỗi token này sang đối tượng signedJWT để đọc 3 thành phần
        // (header, payload, signature)
        SignedJWT signedJWT = SignedJWT.parse(token);
        // ~ Lấy thời gian hiệu lực của token
        Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        // ~ Nếu thời gian bị quá hạn trả về false
        if (expirationTime.before(new Date())) {
            return false;
        }
        MACVerifier verifier = new MACVerifier(keySecret.getBytes(StandardCharsets.UTF_8));
        return signedJWT.verify(verifier);
    }

    @Override
    // . Lấy subject
    public String getSubject(String token) throws ParseException {
        // ~ Chuyển đổi chuỗi token này sang đối tượng signedJWT để đọc 3 thành phần
        // (header, payload, signature)
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getSubject();
    }

    @Override
    // . Lấy claim
    public Object getClaim(String token, String claimName) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getClaim(claimName);
    }

}
