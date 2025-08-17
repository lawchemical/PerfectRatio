#!/usr/bin/env swift
// Test script to verify Railway backend connection from iOS app perspective

import Foundation

// Configuration matching iOS app
struct TestConfig {
    static let railwayURL = "https://perfectratio-production-fbe3.up.railway.app"
    static let apiKey = "pr_live_EYHgxAGy5P6GPVTrkZj24RViS29eB7nU3uMsTp5XU_w"
}

// Test function
func testRailwayConnection() async {
    print("🧪 Testing Railway Backend Connection...")
    print("📍 URL: \(TestConfig.railwayURL)")
    print("🔑 Using new secure API key")
    print("")
    
    // Test 1: Health endpoint
    print("1️⃣ Testing /health endpoint...")
    await testEndpoint(path: "/health", requiresAuth: false)
    
    // Test 2: Suppliers endpoint with API key
    print("\n2️⃣ Testing /api/suppliers endpoint with authentication...")
    await testEndpoint(path: "/api/suppliers", requiresAuth: true)
    
    // Test 3: Full catalog sync endpoint
    print("\n3️⃣ Testing /api/sync/catalog endpoint...")
    await testEndpoint(path: "/api/sync/catalog", requiresAuth: true)
}

func testEndpoint(path: String, requiresAuth: Bool) async {
    guard let url = URL(string: TestConfig.railwayURL + path) else {
        print("   ❌ Invalid URL")
        return
    }
    
    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    if requiresAuth {
        request.setValue(TestConfig.apiKey, forHTTPHeaderField: "x-api-key")
    }
    
    request.timeoutInterval = 10
    
    do {
        let (data, response) = try await URLSession.shared.data(for: request)
        
        if let httpResponse = response as? HTTPURLResponse {
            print("   📊 Status: \(httpResponse.statusCode)")
            
            if httpResponse.statusCode == 200 {
                print("   ✅ Success!")
                
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    if let cached = json["cached"] as? Bool {
                        print("   📦 Data cached: \(cached)")
                    }
                    if let dataArray = json["data"] as? [[String: Any]] {
                        print("   📝 Records returned: \(dataArray.count)")
                    }
                }
            } else if httpResponse.statusCode == 401 {
                print("   ❌ Authentication failed - API key rejected")
                if let errorData = String(data: data, encoding: .utf8) {
                    print("   💬 Error: \(errorData)")
                }
            } else {
                print("   ⚠️ Unexpected status code")
                if let errorData = String(data: data, encoding: .utf8) {
                    print("   💬 Response: \(errorData)")
                }
            }
        }
    } catch {
        print("   ❌ Connection failed: \(error.localizedDescription)")
    }
}

// Run the test
Task {
    await testRailwayConnection()
    print("\n✨ Test complete!")
    print("\n📋 Next Steps:")
    print("1. Update Railway environment variables with new API key")
    print("2. Ensure iOS app Config.xcconfig has the correct API key")
    print("3. Test sync functionality in the iOS app")
    exit(0)
}

RunLoop.main.run()