#!/usr/bin/env python3
"""
Calculate base prices from current randomized prices using Shipwrecked's algorithm.

This script reverse-engineers the base prices by using the known algorithm:
1. SHA256 hash of f"{userId}-{itemId}-{currentHour}"
2. Convert first 8 hex chars to random number 0-1
3. Scale to percentage between min_percent (90%) and max_percent (110%)
4. Apply to base price with proper clamping

Usage: python calculate_base_price.py
"""

import hashlib
import math
import json
from datetime import datetime
from typing import Dict, List, Any

def create_hourly_random(user_id: str, item_id: str, hour: int) -> float:
    """
    Create deterministic random number using SHA256 hash.
    Matches the JavaScript implementation exactly.
    """
    combined = f"{user_id}-{item_id}-{hour}"
    hash_obj = hashlib.sha256(combined.encode())
    hash_hex = hash_obj.hexdigest()
    
    # Take first 8 characters (32 bits)
    sub_hash = hash_hex[:8]
    int_hash = int(sub_hash, 16)
    
    # Convert to 0-1 range
    return int_hash / 0xffffffff

def calculate_randomized_price(user_id: str, item_id: str, base_price: int, 
                             min_percent: float = 90, max_percent: float = 110) -> int:
    """
    Calculate what the randomized price would be for given base price.
    This matches the JavaScript implementation exactly.
    """
    # Get current hour
    current_hour = math.floor(datetime.now().timestamp() / 3600)
    
    # Get deterministic random
    random_val = create_hourly_random(user_id, item_id, current_hour)
    
    # Calculate bounds
    safe_min_percent = max(1, min_percent)
    safe_max_percent = max(safe_min_percent + 1, max_percent)
    
    min_price = math.floor(base_price * safe_min_percent / 100)
    max_price = math.ceil(base_price * safe_max_percent / 100)
    
    # Calculate random percentage
    percent_range = safe_max_percent - safe_min_percent
    random_percent = safe_min_percent + (random_val * percent_range)
    price_multiplier = random_percent / 100
    
    # Calculate and clamp price
    randomized_price = round(base_price * price_multiplier)
    clamped_price = max(min_price, min(max_price, randomized_price))
    
    return max(1, clamped_price)

def reverse_engineer_base_price(user_id: str, item_id: str, current_price: int,
                               min_percent: float = 90, max_percent: float = 110) -> int:
    """
    Reverse engineer the base price from current randomized price.
    
    Strategy: Since we know the exact algorithm, we can work backwards.
    The randomized price = base_price * random_percentage, so:
    base_price = randomized_price / random_percentage
    """
    current_hour = math.floor(datetime.now().timestamp() / 3600)
    random_val = create_hourly_random(user_id, item_id, current_hour)
    
    # Calculate the percentage multiplier that was used
    safe_min_percent = max(1, min_percent)
    safe_max_percent = max(safe_min_percent + 1, max_percent)
    percent_range = safe_max_percent - safe_min_percent
    random_percent = safe_min_percent + (random_val * percent_range)
    price_multiplier = random_percent / 100
    
    # Reverse calculate base price
    estimated_base_price = current_price / price_multiplier
    
    # Round to nearest integer since base prices are integers
    base_price_candidate = round(estimated_base_price)
    
    # Verify our calculation by checking if it produces the same current price
    verification_price = calculate_randomized_price(user_id, item_id, base_price_candidate, min_percent, max_percent)
    
    if verification_price == current_price:
        return base_price_candidate
    
    # If not exact match, try nearby values (due to rounding effects)
    for offset in range(-5, 6):
        test_base = base_price_candidate + offset
        if test_base > 0:
            test_price = calculate_randomized_price(user_id, item_id, test_base, min_percent, max_percent)
            if test_price == current_price:
                return test_base
    
    # If still no match, return best estimate
    print(f"Warning: Could not find exact base price for {item_id}. Current: {current_price}, Estimated base: {base_price_candidate}, Verification: {verification_price}")
    return base_price_candidate

def calculate_shell_price(usd_cost: float, dollars_per_hour: float = 10.0) -> int:
    """Calculate shell price using the phi formula for travel stipend."""
    if dollars_per_hour <= 0:
        return 0
    
    phi = (1 + math.sqrt(5)) / 2  # Golden ratio
    hours = usd_cost / dollars_per_hour
    return round(hours * phi * 10)

def main():
    # Your user ID
    user_id = "cmcxl99oj00r9mt01sy59w923"
    
    # Your current item prices (from the JSON you provided)
    current_items = [
        {
            "id": "cmebn7caq0118nv01spx78x4t",
            "name": "Raspbery PI 5",
            "description": "Tiny board, massive possibilities, hack anything!",
            "image": "https://m.media-amazon.com/images/I/61EQZoZvcEL._AC_SX679_.jpg",
            "price": 464
        },
        {
            "id": "cmebn55yi0116nv01orzpor1v",
            "name": "Samsung T7 1TB SSD",
            "description": "Pocket-sized speedster, bulk up storage without the lag!",
            "image": "https://summer.hackclub.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsiZGF0YSI6NTA4MjQsInB1ciI6ImJsb2JfaWQifX0=--c85a007e74ea5713fd31d769f0fb2a286bf8c7bd/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fbGltaXQiOlsyNTYsMjU2XX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--69edd5fc8f56201b3f04f7560743d8fad0d8d976/2025_08_14_0g5_Kleki.png",
            "price": 541
        },
        {
            "id": "cmebmn7um010wnv012eongfmj",
            "name": "Flipper Zero",
            "description": "Your digital multi-tool for hacking fun, cyber adventures await!",
            "image": "https://summer.hackclub.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsiZGF0YSI6OTYsInB1ciI6ImJsb2JfaWQifX0=--355255c6559988d0ce586e089449e3280bfd4e29/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fbGltaXQiOlsyNTYsMjU2XX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--69edd5fc8f56201b3f04f7560743d8fad0d8d976/2025_06_15_0th_Kleki.png",
            "price": 1066
        },
        {
            "id": "cme97z84p00r7nv01etg8md2q",
            "name": "iPad 11-inch + Apple Pencil (USB-C)",
            "description": "Draw, note, and doodle like a pro, paper is so last century!",
            "image": "https://summer.hackclub.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsiZGF0YSI6MjM5LCJwdXIiOiJibG9iX2lkIn19--00b9312b1ea065d925f83ad3b53d6684eff483f4/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fbGltaXQiOlsyNTYsMjU2XX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--69edd5fc8f56201b3f04f7560743d8fad0d8d976/2025_06_16_0qh_Kleki(1).png",
            "price": 1903
        },
        {
            "id": "cmdsx1fef0052sd01ygneytpv",
            "name": "E-fidgets",
            "description": "All the fun of a fidget but with no moving parts!",
            "image": "https://hc-cdn.hel1.your-objectstorage.com/s/v3/f41404149d4e37c370989a1617452b0db8a15b9b_image.png",
            "price": 58
        },
        {
            "id": "cmdmch4xb056cqn01rc10afcq",
            "name": "Donate a shell to the void",
            "description": "Self explanatory. No refunds!",
            "image": "https://hc-cdn.hel1.your-objectstorage.com/s/v3/58570ed145749843df2c2473de3d8015590d5bb6_void.webp",
            "price": 1
        },
        {
            "id": "cmdelz54j00celf013dx0xr84",
            "name": "RTL-SDR V4 Kit",
            "description": "Turn your PC into an all-band radio scanner, sideband digging fun!",
            "image": "https://hc-cdn.hel1.your-objectstorage.com/s/v3/8279d13adf6af77e72eeb5f301b63bc24d4a7b42_rtl-sdr_v4_kit.jpg",
            "price": 292
        },
        {
            "id": "cmdelstju00cclf01v5y89dr9",
            "name": "Pinetime",
            "description": "Open-source smartwatch, tick in style, tinker at will!",
            "image": "https://hc-cdn.hel1.your-objectstorage.com/s/v3/195d7241f6c6c04f77efe1ac7490720fdf3a868f_pinetime.png",
            "price": 254
        },
        {
            "id": "cmdelpbl000calf01fhievo7a",
            "name": "Universal AI Credit",
            "description": "OpenAI, Anthropic, Groq, Gemini, Cursor, Openrouter, all the AI you crave!",
            "image": "https://hc-cdn.hel1.your-objectstorage.com/s/v3/14ad26063d941e9c6d917d4c78c9cdbd15c4c6e5_universal_ai_credit.png",
            "price": 49
        },
        {
            "id": "cmdel7uer00c8lf017kdhtiaa",
            "name": "Centauri",
            "description": "Ever wanted a printer that can print out of the box and auto calibrate? Here ya go!",
            "image": "https://hc-cdn.hel1.your-objectstorage.com/s/v3/a51dda2074f5aa4bdf304ec7163becd20f8003ee_centauri.webp",
            "price": 1294
        },
        {
            "id": "cmdel771k00c6lf01coz5rlhz",
            "name": "Centauri Carbon",
            "description": "Ever wanted a printer that can print out of the box and auto calibrate and print carbon fiber? Here ya go!",
            "image": "https://hc-cdn.hel1.your-objectstorage.com/s/v3/3ed4b029d631da804476a739ad61aac228fcfd0f_centauri_carbon.png",
            "price": 1802
        },
        {
            "id": "cmdel4iob00c3lf01obbetleo",
            "name": "M4 mac mini",
            "description": "Pocket-rocket performance in a mini chassis, meet your new desk boss!",
            "image": "https://hc-cdn.hel1.your-objectstorage.com/s/v3/eeaa6eedf312fdd412e119d44e2ec8401e2fe27d_m4_mac_mini.jpg",
            "price": 2685
        },
        {
            "id": "cmd7in0r4000kro01x3l2c1v8",
            "name": "Travel Stipend",
            "description": "A $10 Travel Stipend to get you to the Island. Stack up as many of these as you want!",
            "image": "https://hc-cdn.hel1.your-objectstorage.com/s/v3/b1bc731ce06be80dae2080af70cb11b4bbcba617_travelstipend.jpg",
            "price": 16
        }
    ]
    
    print("Shipwrecked Base Price Calculator")
    print("=" * 50)
    print(f"User ID: {user_id}")
    print(f"Current timestamp: {datetime.now()}")
    print(f"Current hour: {math.floor(datetime.now().timestamp() / 3600)}")
    print()
    
    results = []
    
    for item in current_items:
        item_id = item["id"]
        name = item["name"]
        current_price = item["price"]
        
        # Special handling for fixed price items
        if name.lower().startswith("donate a shell to the void"):
            # Void is always 1 shell
            base_price = 1
            print(f"{name:25} | Current: {current_price:4} | Base: {base_price:4} | Type: Fixed")
        elif name.lower().startswith("travel stipend"):
            # Travel stipend uses calculateShellPrice formula
            # Based on $10 USD at default $10/hour rate
            base_price = calculate_shell_price(10.0, 10.0)
            print(f"{name:25} | Current: {current_price:4} | Base: {base_price:4} | Type: Formula")
        else:
            # Regular randomized pricing
            base_price = reverse_engineer_base_price(user_id, item_id, current_price)
            
            # Show the discount/markup percentage
            current_hour = math.floor(datetime.now().timestamp() / 3600)
            random_val = create_hourly_random(user_id, item_id, current_hour)
            percent_range = 110 - 90  # max - min
            random_percent = 90 + (random_val * percent_range)
            
            if current_price < base_price:
                discount = ((base_price - current_price) / base_price) * 100
                status = f"📉 {discount:.1f}% off"
            elif current_price > base_price:
                markup = ((current_price - base_price) / base_price) * 100
                status = f"📈 {markup:.1f}% up"
            else:
                status = "🎯 exact"
                
            print(f"{name:25} | Current: {current_price:4} | Base: {base_price:4} | {status}")
        
        results.append({
            "id": item_id,
            "name": name,
            "currentPrice": current_price,
            "basePrice": base_price
        })
    
    # Save results to JSON file
    output_file = "base_prices.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print()
    print(f"Results saved to {output_file}")
    print()
    print("Base prices calculated! You can now use these in your shop tracker.")

if __name__ == "__main__":
    main()
