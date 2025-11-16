import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchCategories,
  nextStep,
  prevStep,
  setStep,
  submitRequest,
  resetForm,
} from "../features/request/store/createRequestSlice";
import GeneralInformationStep from "./GeneralInformationStep";
import UploadPhotosStep from "./UploadPhotosStep";
import DetermineDeadlineStep from "./DetermineDeadlineStep";
import SetupAddressStep from "./SetupAddressStep";
import { useAttachTaskPhoto } from "../features/photo";
import { useTheme } from "../hooks/useTheme";
import useAuth from "../features/authentication/hooks/useAuth";

const steps = [
  "General Information",
  "Upload Photos",
  "Determine Deadline",
  "Setup Address",
];

const CreateRequestPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { currentStep, loading, success, error, formData } = useSelector(
    (state) => state.createRequest
  );
  const { attachPhoto } = useAttachTaskPhoto();
  const generalInfoRef = useRef();
  const setupAddressRef = useRef();
  const [validationError, setValidationError] = useState(null);
  const { colors } = useTheme();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname }, replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  useEffect(() => {
    // Fetch categories when component mounts
    dispatch(fetchCategories());
  }, [dispatch]);
  // Get form data from redux store
  // Handle form submission
  const handleSubmit = async () => {
    try {
      const result = await dispatch(submitRequest(formData)).unwrap();
      const createdTaskId = result?.task?.id ?? result?.requestId;

      if (createdTaskId && Array.isArray(formData.photos)) {
        for (const photo of formData.photos) {
          if (photo instanceof File) {
            try {
              await attachPhoto(photo, createdTaskId);
            } catch (attachmentError) {
              console.error("Failed to attach photo:", attachmentError);
            }
          }
        }
      }
    } catch (submissionError) {
      console.error("Request submission failed:", submissionError);
    }
  };

  // Handle step navigation
  const handleNext = async () => {
    if (currentStep === 0 && generalInfoRef.current) {
      const valid = await generalInfoRef.current.validateForm();
      if (!valid) return;
    }

    if (currentStep === steps.length - 1) {
      // Validate address step before final submission
      if (setupAddressRef.current) {
        const isAddressValid = await setupAddressRef.current.validateForm();
        if (!isAddressValid) {
          setValidationError(
            "Please select your location (country, city, and district) before creating the request."
          );
          return;
        }
      }
      setValidationError(null);
      handleSubmit();
    } else {
      dispatch(nextStep());
    }
  };

  const handleBack = () => {
    dispatch(prevStep());
  };

  // Navigate to home page if submission was successful
  useEffect(() => {
    if (success) {
      const timeoutId = setTimeout(() => {
        dispatch(resetForm());
        navigate("/");
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [success, navigate, dispatch]);

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <GeneralInformationStep ref={generalInfoRef} />;
      case 1:
        return <UploadPhotosStep />;
      case 2:
        return <DetermineDeadlineStep />;
      case 3:
        return <SetupAddressStep ref={setupAddressRef} />;
      default:
        return <p>Unknown step</p>;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Main content */}
      <main style={{ flexGrow: 1, padding: "24px", overflow: "auto" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          {/* Form header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 500,
                color: colors.text.primary,
              }}
            >
              Create Request &gt; {steps[currentStep]}
            </h1>
          </div>

          {/* Stepper */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "32px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {steps.map((label, index) => (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      color:
                        index <= currentStep
                          ? colors.brand.primary
                          : colors.text.tertiary,
                    }}
                    onClick={() => dispatch(setStep(index))}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        border: `2px solid ${
                          index === currentStep
                            ? colors.brand.primary
                            : index < currentStep
                            ? colors.brand.primary
                            : colors.border.secondary
                        }`,
                        backgroundColor:
                          index === currentStep
                            ? colors.brand.primary
                            : index < currentStep
                            ? colors.brand.primary
                            : colors.background.elevated,
                        color:
                          index <= currentStep
                            ? colors.text.inverse
                            : colors.text.tertiary,
                      }}
                    >
                      {index + 1}
                    </div>
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        display: window.innerWidth >= 640 ? "block" : "none",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      style={{
                        width: "48px",
                        height: "2px",
                        margin: "0 16px",
                        backgroundColor:
                          index < currentStep
                            ? colors.brand.primary
                            : colors.border.secondary,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Success message */}
          {success ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                marginBottom: "24px",
                backgroundColor: `${colors.semantic.success}10`,
                borderRadius: "8px",
                boxShadow: colors.shadow.sm,
                border: `1px solid ${colors.semantic.success}`,
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 500,
                  color: colors.semantic.success,
                  marginBottom: "8px",
                }}
              >
                Your request has been submitted successfully!
              </h3>
              <p style={{ fontSize: "1rem", color: colors.text.primary }}>
                You will be redirected to the home page shortly.
              </p>
            </div>
          ) : null}

          {/* Error message */}
          {error ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                marginBottom: "24px",
                backgroundColor: `${colors.semantic.error}10`,
                borderRadius: "8px",
                boxShadow: colors.shadow.sm,
                border: `1px solid ${colors.semantic.error}`,
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 500,
                  color: colors.semantic.error,
                }}
              >
                Error: {error}
              </h3>
            </div>
          ) : null}

          {/* Validation error for address/location */}
          {validationError ? (
            <div
              style={{
                padding: "16px",
                textAlign: "center",
                marginBottom: "24px",
                backgroundColor: `${colors.semantic.error}10`,
                borderRadius: "8px",
                boxShadow: colors.shadow.sm,
                border: `1px solid ${colors.semantic.error}`,
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: colors.semantic.error,
                }}
              >
                {validationError}
              </p>
            </div>
          ) : null}

          {/* Step content */}
          <div
            style={{
              padding: "24px",
              marginBottom: "32px",
              borderRadius: "8px",
              border: `1px solid ${colors.border.primary}`,
              backgroundColor: colors.background.elevated,
            }}
          >
            {renderStep()}
          </div>

          {/* Navigation buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "32px",
            }}
          >
            <div>
              {currentStep > 0 && (
                <button
                  style={{
                    color: colors.text.secondary,
                    background: "none",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                    fontSize: "1rem",
                    padding: "8px 16px",
                    transition: "color 0.2s",
                  }}
                  onClick={handleBack}
                  disabled={loading}
                  onMouseOver={(e) =>
                    !loading &&
                    (e.currentTarget.style.color = colors.text.primary)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.color = colors.text.secondary)
                  }
                >
                  Back
                </button>
              )}
            </div>
            <div>
              <button
                style={{
                  backgroundColor: loading
                    ? colors.interactive.disabled
                    : colors.brand.primary,
                  color: colors.text.inverse,
                  padding: "8px 32px",
                  borderRadius: "9999px",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  transition: "background-color 0.2s",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
                onClick={handleNext}
                disabled={loading}
                onMouseOver={(e) =>
                  !loading &&
                  (e.currentTarget.style.backgroundColor =
                    colors.brand.primaryHover)
                }
                onMouseOut={(e) =>
                  !loading &&
                  (e.currentTarget.style.backgroundColor = colors.brand.primary)
                }
              >
                {currentStep === steps.length - 1 ? "Create Request" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateRequestPage;
