import React, { useState, useEffect } from 'react'; // Import useEffect for cleanup
import axios from 'axios';

// Backend API URL - Ensure this is accessible from the browser
const API_URL = "http://localhost:8080";

const QRCodeGenerator = () => {
  // State for the input URL
  const [url, setUrl] = useState('');
  // State for the generated QR code image Object URL
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  // State to hold potential error messages for display in UI
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // State for UI error message

  /**
   * Handles the QR code generation request.
   */
  const handleGenerate = async () => {
    console.log('Attempting to generate QR code for URL via:', API_URL);
    setErrorMsg(null); // Clear previous errors on new attempt
    setQrCodeUrl(''); // Clear previous QR code

    // Basic check if URL is empty
    if (!url.trim()) {
        setErrorMsg('Please enter a URL.'); // Use state for validation message
        return;
    }
     if (!url.startsWith('http://') && !url.startsWith('https://')) {
       setErrorMsg('URL must start with http:// or https://'); // Use state for validation message
       return;
    }


    try {
      // Make GET request to the backend
      const res = await axios.get(
        `${API_URL}/generate`, {
          params: { url }, // Pass the URL as a query parameter
          responseType: 'blob' // Expect an image blob back
        }
      );

      // Create a temporary local URL for the received image blob
      const imageUrl = URL.createObjectURL(res.data);
      setQrCodeUrl(imageUrl); // Update state to display the image

    } catch (error) {
      // Log the full error for debugging
      console.error('Error generating QR code:', error);

      // --- Check for specific errors to display user-friendly messages ---
      if (axios.isAxiosError(error) && error.response) {
        // Check if the error is 429 (Too Many Requests)
        if (error.response.status === 429) {
          setErrorMsg('Too many requests. Please wait a minute and try again.'); // Specific message for rate limit
        } else {
          // Handle other HTTP errors with a generic message
          setErrorMsg(`Error: Request failed with status code ${error.response.status}. Please try again later.`);
        }
      } else {
        // Handle network errors or other unexpected issues
        setErrorMsg('An error occurred while generating the QR code. Please check your connection or try again.');
      }
    }
  };

  // Effect for cleaning up the object URL when the component unmounts or the URL changes
  useEffect(() => {
    const currentQrCodeUrl = qrCodeUrl; // Capture the URL at the time the effect runs
    // Return a cleanup function
    return () => {
      if (currentQrCodeUrl) {
        URL.revokeObjectURL(currentQrCodeUrl); // Release the object URL memory
        console.log('Revoked Object URL:', currentQrCodeUrl);
      }
    };
  }, [qrCodeUrl]); // Dependency array: run cleanup when qrCodeUrl changes

  /**
   * Handles changes in the input field.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (errorMsg) {
        setErrorMsg(null); // Clear error message when user types
    }
  };


  // --- JSX Structure with Error Message Display ---
  return (
    <div>
      {/* Input field for the URL */}
      <input
        type="text" // Changed to text, but 'url' might be more semantic
        value={url}
        onChange={handleInputChange} // Use updated handler
        placeholder="Entrez une URL" // Original placeholder
        style={{ width: '300px', padding: '0.5rem', marginRight: '1rem', border: errorMsg ? '1px solid red' : '1px solid #ccc' }} // Highlight input on error
      />
      {/* Button to trigger generation */}
      <button onClick={handleGenerate} style={{ padding: '0.5rem 1rem' }}> {/* Original styles */}
        Générer {/* Original button text */}
      </button>

      {/* Display Error Message if it exists */}
      {errorMsg && (
        <div style={{ marginTop: '1rem', color: 'red', border: '1px solid red', padding: '0.5rem', backgroundColor: '#ffeeee' }}>
          {errorMsg}
        </div>
      )}

      {/* Conditional display for the generated QR code (only if no error) */}
      {qrCodeUrl && !errorMsg && (
        <div style={{ marginTop: '2rem' }}> {/* Original styles */}
          <h3>QR Code :</h3>
          <img
            src={qrCodeUrl}
            alt="QR Code"
            // Add basic error handling for the image element itself
            onError={() => {
               console.error('Failed to load image from Object URL:', qrCodeUrl);
               setErrorMsg('Failed to display the generated QR Code image.'); // Use state for image load error
               setQrCodeUrl(''); // Clear the broken URL state
            }}
           />
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;
