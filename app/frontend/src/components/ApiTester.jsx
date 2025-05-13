// filepath: ApiTester.jsx
import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { authAPI } from "../utils/api";

const ApiTester = () => {
  const [endpoint, setEndpoint] = useState("/auth/login/");
  const [payload, setPayload] = useState(
    '{\n  "email": "test@example.com",\n  "password": "password123"\n}'
  );
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let payloadObj = {};
      try {
        payloadObj = JSON.parse(payload);
      } catch (e) {
        setError("Invalid JSON in payload");
        setLoading(false);
        return;
      }

      console.log(`Testing API: ${endpoint}`, payloadObj);

      // Use the underlying axios instance from your API module
      const api = authAPI.getAxiosInstance ? authAPI.getAxiosInstance() : null;

      if (!api) {
        // Fallback to direct API call
        const endpointName = endpoint.split("/").filter(Boolean).pop();
        if (authAPI[endpointName]) {
          const result = await authAPI[endpointName](payloadObj);
          setResponse(result);
        } else {
          setError(`No direct method found for ${endpoint}`);
        }
      } else {
        // Use axios instance directly
        const result = await api.post(endpoint, payloadObj);
        setResponse(result.data);
      }
    } catch (err) {
      console.error("API test error:", err);
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        API Tester
      </Typography>

      <TextField
        fullWidth
        label="API Endpoint"
        value={endpoint}
        onChange={(e) => setEndpoint(e.target.value)}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Request Payload (JSON)"
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
        margin="normal"
        multiline
        rows={4}
      />

      <Button
        variant="contained"
        onClick={handleTest}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? "Testing..." : "Test API"}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {typeof error === "object" ? JSON.stringify(error, null, 2) : error}
        </Alert>
      )}

      {response && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Response:</Typography>
          <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};

export default ApiTester;
