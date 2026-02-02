"""
Supabase HTTP client using httpx for async database operations.
"""
import os

import httpx

# Load Supabase configuration from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


def get_supabase_headers() -> dict:
    """
    Returns the required headers for Supabase REST API requests.
    """
    return {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }


async def supabase_select(table: str, query: str = "*") -> dict | list:
    """
    Performs a SELECT query on a Supabase table.

    Args:
        table: The name of the table to query.
        query: The columns to select (default: "*" for all columns).

    Returns:
        The JSON response data if successful, or an error dictionary.
    """
    url = f"{SUPABASE_URL}/rest/v1/{table}?select={query}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_supabase_headers())

    if response.status_code == 200:
        return response.json()
    else:
        return {
            "error": True,
            "status_code": response.status_code,
            "details": response.text,
        }


async def supabase_select_by_id(table: str, row_id: str, query: str = "*") -> dict | None:
    """
    Fetches a single row from a Supabase table by its ID.

    Args:
        table: The name of the table to query.
        row_id: The ID of the row to fetch.
        query: The columns to select (default: "*" for all columns).

    Returns:
        The row data as a dictionary if found, None if not found, or an error dictionary.
    """
    url = f"{SUPABASE_URL}/rest/v1/{table}?select={query}&id=eq.{row_id}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_supabase_headers())

    if response.status_code == 200:
        data = response.json()
        return data[0] if data else None
    else:
        return {
            "error": True,
            "status_code": response.status_code,
            "details": response.text,
        }


async def supabase_select_where_in(
    table: str, 
    column: str, 
    values: list[str], 
    query: str = "*"
) -> dict | list:
    """
    Fetches rows from a Supabase table where a column value is in a list.

    Args:
        table: The name of the table to query.
        column: The column to filter by.
        values: List of values to match.
        query: The columns to select (default: "*" for all columns).

    Returns:
        The matching rows as a list, or an error dictionary.
    """
    if not values:
        return []

    # Build IN filter: column=in.(val1,val2,val3)
    values_str = ",".join(values)
    url = f"{SUPABASE_URL}/rest/v1/{table}?select={query}&{column}=in.({values_str})"

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_supabase_headers())

    if response.status_code == 200:
        return response.json()
    else:
        return {
            "error": True,
            "status_code": response.status_code,
            "details": response.text,
        }


async def supabase_insert(table: str, data: dict) -> dict | list:
    """
    Inserts a row into a Supabase table.

    Args:
        table: The name of the table to insert into.
        data: The data to insert as a dictionary.

    Returns:
        The inserted row data if successful, or an error dictionary.
    """
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    
    print(f"[supabase_insert] Table: {table}")
    print(f"[supabase_insert] URL: {url}")
    print(f"[supabase_insert] Data: {data}")

    headers = get_supabase_headers()
    headers["Prefer"] = "return=representation"

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data)

    print(f"[supabase_insert] Response status: {response.status_code}")
    print(f"[supabase_insert] Response body: {response.text[:500] if response.text else 'empty'}")
    
    if response.status_code in (200, 201):
        result = response.json()
        return result[0] if isinstance(result, list) and len(result) > 0 else result
    else:
        error_result = {
            "error": True,
            "status_code": response.status_code,
            "details": response.text,
        }
        print(f"[supabase_insert] ERROR: {error_result}")
        return error_result


async def supabase_update_by_id(table: str, row_id: str, data: dict) -> dict | None:
    """
    Updates a row in a Supabase table by its ID.

    Args:
        table: The name of the table to update.
        row_id: The ID of the row to update.
        data: The data to update as a dictionary (only fields to update).

    Returns:
        The updated row data if successful, or an error dictionary.
    """
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{row_id}"

    headers = get_supabase_headers()
    headers["Prefer"] = "return=representation"

    async with httpx.AsyncClient() as client:
        response = await client.patch(url, headers=headers, json=data)

    if response.status_code in (200, 204):
        result = response.json()
        return result[0] if isinstance(result, list) and len(result) > 0 else result
    else:
        return {
            "error": True,
            "status_code": response.status_code,
            "details": response.text,
        }


async def supabase_select_where(
    table: str,
    filters: dict[str, any],
    query: str = "*"
) -> dict | list:
    """
    Fetches rows from a Supabase table with flexible WHERE clause filters.

    Args:
        table: The name of the table to query.
        filters: Dictionary of column-value pairs for equality filters.
                 Special operators can be used with tuple values:
                 - ("neq", value) for not equal
                 - ("in", [values]) for IN clause
                 - ("not.in", [values]) for NOT IN clause
        query: The columns to select (default: "*" for all columns).

    Returns:
        The matching rows as a list, or an error dictionary.
    """
    # Build filter string
    filter_parts = []
    for column, value in filters.items():
        if isinstance(value, tuple) and len(value) == 2:
            operator, val = value
            if operator == "neq":
                filter_parts.append(f"{column}=neq.{val}")
            elif operator == "in":
                vals = ",".join(str(v) for v in val)
                filter_parts.append(f"{column}=in.({vals})")
            elif operator == "not.in":
                vals = ",".join(str(v) for v in val)
                filter_parts.append(f"{column}=not.in.({vals})")
        else:
            filter_parts.append(f"{column}=eq.{value}")
    
    filter_str = "&".join(filter_parts)
    url = f"{SUPABASE_URL}/rest/v1/{table}?select={query}&{filter_str}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_supabase_headers())

    if response.status_code == 200:
        return response.json()
    else:
        return {
            "error": True,
            "status_code": response.status_code,
            "details": response.text,
        }

