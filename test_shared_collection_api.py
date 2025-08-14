#!/usr/bin/env python3
"""
Test script for the new shared collection API endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_shared_collection_endpoints():
    """Test the new shared collection API endpoints"""

    # First, let's get the list of shared collections
    print("Testing shared collections list endpoint...")
    response = requests.get(f"{BASE_URL}/shared/")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Found {len(data.get('shared', []))} shared collections")

        if data.get('shared'):
            collection = data['shared'][0]
            collection_id = collection['id']
            print(f"Using collection ID: {collection_id}")

            # Test adding a product to the collection
            print(f"\nTesting add product to collection endpoint...")
            # We'll use a dummy product ID for testing
            product_id = 1
            add_response = requests.post(f"{BASE_URL}/shared/{collection_id}/add-product/{product_id}")
            print(f"Add product status: {add_response.status_code}")
            if add_response.status_code == 200:
                print("Product added successfully!")
            else:
                print(f"Error: {add_response.text}")

            # Test checking if product is in collection
            print(f"\nTesting check product in collection endpoint...")
            check_response = requests.get(f"{BASE_URL}/shared/{collection_id}/has-product/{product_id}")
            print(f"Check product status: {check_response.status_code}")
            if check_response.status_code == 200:
                data = check_response.json()
                print(f"Product in collection: {data.get('has_product')}")
            else:
                print(f"Error: {check_response.text}")

            # Test removing product from collection
            print(f"\nTesting remove product from collection endpoint...")
            remove_response = requests.delete(f"{BASE_URL}/shared/{collection_id}/remove-product/{product_id}")
            print(f"Remove product status: {remove_response.status_code}")
            if remove_response.status_code == 200:
                print("Product removed successfully!")
            else:
                print(f"Error: {remove_response.text}")

            # Test checking again after removal
            print(f"\nTesting check product in collection after removal...")
            check_after_remove = requests.get(f"{BASE_URL}/shared/{collection_id}/has-product/{product_id}")
            print(f"Check after removal status: {check_after_remove.status_code}")
            if check_after_remove.status_code == 200:
                data = check_after_remove.json()
                print(f"Product in collection after removal: {data.get('has_product')}")
            else:
                print(f"Error: {check_after_remove.text}")
        else:
            print("No shared collections found to test with")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_shared_collection_endpoints()
