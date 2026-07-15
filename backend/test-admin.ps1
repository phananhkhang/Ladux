$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8080/api/v1'
$pass = 0; $fail = 0
function Step($name, $block) {
    try {
        $r = & $block
        Write-Host ("PASS  " + $name)
        $script:pass++
        return $r
    } catch {
        $script:fail++
        $msg = $_.Exception.Message
        $body = ''
        try {
            $resp = $_.Exception.Response
            if ($resp) {
                $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
                $body = $sr.ReadToEnd()
            }
        } catch {}
        Write-Host ("FAIL  " + $name + "  -> " + $msg + "  " + $body)
        return $null
    }
}

# 1) LOGIN ADMIN (Bearer -> bypass CSRF)
$login = Step 'login admin' {
    Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' `
        -Body '{"username":"admin","password":"Admin@123"}'
}
if (-not $login) { Write-Host 'Cannot login, abort.'; exit 1 }
$token = $login.token
$H = @{ Authorization = "Bearer $token" }
Write-Host ("token len = " + $token.Length)

# ============ BRAND ============
$brand = Step 'brand create' {
    Invoke-RestMethod -Method Post -Uri "$base/admin/brands" -Headers $H -ContentType 'application/json' `
        -Body '{"name":"TestBrand QA"}'
}
$brandId = $brand.id
Write-Host ("  brandId=$brandId")

Step 'brand update' {
    Invoke-RestMethod -Method Put -Uri "$base/admin/brands/$brandId" -Headers $H -ContentType 'application/json' `
        -Body '{"name":"TestBrand QA Updated"}'
} | Out-Null

# ============ CATEGORY ============
$cat = Step 'category create (root)' {
    Invoke-RestMethod -Method Post -Uri "$base/admin/categories" -Headers $H -ContentType 'application/json' `
        -Body '{"name":"TestCat QA"}'
}
$catId = $cat.id
Write-Host ("  catId=$catId")

$catChild = Step 'category create (child)' {
    Invoke-RestMethod -Method Post -Uri "$base/admin/categories" -Headers $H -ContentType 'application/json' `
        -Body ('{"name":"TestCat Child","parentId":' + $catId + '}')
}
$catChildId = $catChild.id

Step 'category update' {
    Invoke-RestMethod -Method Put -Uri "$base/admin/categories/$catId" -Headers $H -ContentType 'application/json' `
        -Body '{"name":"TestCat QA Updated"}'
} | Out-Null

# ============ PRODUCT ============
$sku = 'QA-SKU-' + (Get-Random -Maximum 999999)
$prodBody = @{
    brandId = $brandId; categoryId = $catChildId; sku = $sku; name = 'QA Product';
    basePrice = 1000000; discountPrice = 800000; stockQuantity = 25;
    specs = '{"color":"black"}'; thumbnail = 'https://img.example.com/p.png';
    isActive = $true; imageUrls = @('https://img.example.com/p1.png')
} | ConvertTo-Json -Compress
$prod = Step 'product create' {
    Invoke-RestMethod -Method Post -Uri "$base/admin/products" -Headers $H -ContentType 'application/json' -Body $prodBody
}
$prodId = $prod.id
Write-Host ("  prodId=$prodId")

$prodUpd = @{
    brandId = $brandId; categoryId = $catChildId; sku = $sku; name = 'QA Product Updated';
    basePrice = 1000000; discountPrice = 700000; stockQuantity = 40;
    specs = '{"color":"white"}'; thumbnail = 'https://img.example.com/p2.png';
    isActive = $true; imageUrls = @('https://img.example.com/p2.png')
} | ConvertTo-Json -Compress
Step 'product update' {
    Invoke-RestMethod -Method Put -Uri "$base/admin/products/$prodId" -Headers $H -ContentType 'application/json' -Body $prodUpd
} | Out-Null

Step 'product get by id (public)' {
    Invoke-RestMethod -Method Get -Uri "$base/products/$prodId"
} | Out-Null

# ============ COUPON ============
$code = 'QA' + (Get-Random -Maximum 99999)
$coupBody = '{"code":"' + $code + '","discountType":"PERCENT","discountValue":10,"minOrderValue":500000,"usageLimit":100,"expiresAt":"31-12-2026 23:59:59"}'
$coup = Step 'coupon create' {
    Invoke-RestMethod -Method Post -Uri "$base/admin/coupons" -Headers $H -ContentType 'application/json' -Body $coupBody
}
$coupId = $coup.id
Write-Host ("  coupId=$coupId code=$code")

Step 'coupon get by id' {
    Invoke-RestMethod -Method Get -Uri "$base/admin/coupons/$coupId" -Headers $H
} | Out-Null

Step 'coupon get by code' {
    Invoke-RestMethod -Method Get -Uri "$base/admin/coupons/code/$code" -Headers $H
} | Out-Null

$coupUpd = '{"code":"' + $code + '","discountType":"PERCENT","discountValue":15,"minOrderValue":400000,"usageLimit":150,"expiresAt":"31-12-2026 23:59:59"}'
Step 'coupon update' {
    Invoke-RestMethod -Method Put -Uri "$base/admin/coupons/$coupId" -Headers $H -ContentType 'application/json' -Body $coupUpd
} | Out-Null

Step 'coupon list' {
    Invoke-RestMethod -Method Get -Uri "$base/admin/coupons?size=5" -Headers $H
} | Out-Null

# ============ NEGATIVE / STABILITY CHECKS ============
# no token -> expect 401/403
Step 'admin brands without token should be denied' {
    try {
        Invoke-RestMethod -Method Post -Uri "$base/admin/brands" -ContentType 'application/json' -Body '{"name":"x"}'
        throw 'expected denial but succeeded'
    } catch {
        $code = [int]$_.Exception.Response.StatusCode
        if ($code -eq 401 -or $code -eq 403) { return "denied($code)" } else { throw }
    }
} | Out-Null

# validation error -> expect 400
Step 'brand create blank name should be 400' {
    try {
        Invoke-RestMethod -Method Post -Uri "$base/admin/brands" -Headers $H -ContentType 'application/json' -Body '{"name":""}'
        throw 'expected 400 but succeeded'
    } catch {
        $code = [int]$_.Exception.Response.StatusCode
        if ($code -eq 400) { return 'got400' } else { throw }
    }
} | Out-Null

# product discount > base -> expect 400
Step 'product discount>base should be 400' {
    $bad = @{ brandId=$brandId; categoryId=$catChildId; sku=('BAD-'+(Get-Random)); name='bad'; basePrice=100; discountPrice=200 } | ConvertTo-Json -Compress
    try {
        Invoke-RestMethod -Method Post -Uri "$base/admin/products" -Headers $H -ContentType 'application/json' -Body $bad
        throw 'expected 400 but succeeded'
    } catch {
        $code = [int]$_.Exception.Response.StatusCode
        if ($code -eq 400) { return 'got400' } else { throw }
    }
} | Out-Null

# ============ CLEANUP (DELETE) ============
Step 'product delete' { Invoke-RestMethod -Method Delete -Uri "$base/admin/products/$prodId" -Headers $H } | Out-Null
Step 'coupon delete'  { Invoke-RestMethod -Method Delete -Uri "$base/admin/coupons/$coupId" -Headers $H } | Out-Null
Step 'category child delete' { Invoke-RestMethod -Method Delete -Uri "$base/admin/categories/$catChildId" -Headers $H } | Out-Null
Step 'category delete' { Invoke-RestMethod -Method Delete -Uri "$base/admin/categories/$catId" -Headers $H } | Out-Null
Step 'brand delete' { Invoke-RestMethod -Method Delete -Uri "$base/admin/brands/$brandId" -Headers $H } | Out-Null

Write-Host ''
Write-Host ("RESULT: PASS=$pass FAIL=$fail")
