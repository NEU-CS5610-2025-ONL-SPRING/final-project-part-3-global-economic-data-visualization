// @ts-ignore
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { countryMap } from '../components/CountryMapping';

export default function CountrySearchPage() {
    // Country name input by user
    const [countryName, setCountryName] = useState('');
    // Country code matching the search result
    const [countryCode, setCountryCode] = useState<string | null>(null);
    // Possible matching countries
    const [matchingCountries, setMatchingCountries] = useState<Array<{name: string, code: string}>>([]);
    const navigate = useNavigate();

    // Update matching countries whenever input changes
    useEffect(() => {
        if (countryName.length >= 3) {
            findMatchingCountries(countryName);
        } else {
            setMatchingCountries([]);
        }
    }, [countryName]);

    // Find countries that match the prefix
    const findMatchingCountries = (prefix: string) => {
        const normalizedPrefix = prefix.toLowerCase();
        const matches = Object.entries(countryMap)
            .filter(([country]) =>
                country.toLowerCase().startsWith(normalizedPrefix)
            )
            .map(([name, code]) => ({ name, code }));

        setMatchingCountries(matches);
    };

    // Select a specific country from the suggestions
    const selectCountry = (name: string, code: string) => {
        setCountryName(name);
        setCountryCode(code);
        setMatchingCountries([]);
    };

    // handleSearch: Find and return the corresponding country code
    const handleSearch = () => {
        const trimmedName = countryName.trim();
        if (!trimmedName) {
            setCountryCode(null);
            return;
        }

        // Convert user input to a consistent format
        const normalized = trimmedName.toLowerCase().replace(/^\w/, c => c.toUpperCase());
        const code = countryMap[normalized];
        if (code) {
            setCountryCode(code);
        } else {
            setCountryCode("Not found");
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Country Code Lookup</h1>
            <div className="mb-4 relative">
                <label className="block mb-2">Country Name:</label>
                <input
                    type="text"
                    className="border p-2 w-full max-w-md"
                    value={countryName}
                    onChange={(e) => setCountryName(e.target.value)}
                    placeholder="Type at least 3 characters to see suggestions"
                />

                {/* Show matching country suggestions */}
                {matchingCountries.length > 0 && (
                    <div className="absolute z-10 bg-white border rounded w-full max-w-md mt-1 max-h-60 overflow-y-auto">
                        {matchingCountries.map((country) => (
                            <div
                                key={country.code}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => selectCountry(country.name, country.code)}
                            >
                                {country.name} ({country.code})
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
                onClick={handleSearch}
            >
                Search
            </button>

            {/* Display search results */}
            {countryCode && (
                <div className="mt-4 p-4 border rounded">
                    <p>
                        {countryCode === 'Not found'
                            ? 'No matching country code found'
                            : `Corresponding ISO 3166-1 alpha-2 Code: **${countryCode}**`
                        }
                    </p>
                </div>
            )}

            {/* Back button */}
            <button
                className="mt-4 bg-gray-300 px-4 py-2 rounded"
                onClick={() => navigate(-1)}>
                Back
            </button>
        </div>
    );
}