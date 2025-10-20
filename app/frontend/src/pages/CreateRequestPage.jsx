import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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

const steps = [
  "General Information",
  "Upload Photos",
  "Determine Deadline",
  "Setup Address",
];

const CreateRequestPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const generalInfoRef = useRef();
  const { currentStep, loading, success, error } = useSelector(
    (state) => state.createRequest
  );

  useEffect(() => {
    // Fetch categories when component mounts
    dispatch(fetchCategories());
  }, [dispatch]);
  // Get form data from redux store
  const { formData } = useSelector((state) => state.createRequest); // Handle form submission
  const handleSubmit = () => {
    // Prepare data for submission
    // Note: Photo upload functionality is temporarily disabled
    const requestData = {
      ...formData,
      photos: [], // Photo upload is disabled, so we pass an empty array
    };

    dispatch(submitRequest(requestData));
  };

  // Handle step navigation
  const handleNext = async () => {
    if (currentStep === 0 && generalInfoRef.current) {
      const valid = await generalInfoRef.current.validateForm();
      if (!valid) return;
    }

    if (currentStep === steps.length - 1) {
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
      // Reset the form data immediately when the submission is successful
      dispatch(resetForm());

      // Navigate to home page after a short delay to show success message
      setTimeout(() => {
        navigate("/");
      }, 1000);
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
        return <SetupAddressStep />;
      default:
        return <p>Unknown step</p>;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Main content */}
      <main className="flex-grow p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Form header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-medium">
              Create Request &gt; {steps[currentStep]}
            </h1>
          </div>

          {/* Stepper */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {steps.map((label, index) => (
                <div key={label} className="flex items-center">
                  <div
                    className={`flex items-center cursor-pointer ${
                      index <= currentStep ? "text-blue-600" : "text-gray-400"
                    }`}
                    onClick={() => dispatch(setStep(index))}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                        index === currentStep
                          ? "bg-blue-600 text-white border-blue-600"
                          : index < currentStep
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-400 border-gray-300"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="ml-2 text-sm font-medium hidden sm:block">
                      {label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-4 ${
                        index < currentStep ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Success message */}
          {success ? (
            <div className="p-6 text-center mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-green-600 mb-2">
                Your request has been submitted successfully!
              </h3>
              <p className="text-base text-gray-700">
                You will be redirected to the home page shortly.
              </p>
            </div>
          ) : null}

          {/* Error message */}
          {error ? (
            <div className="p-6 text-center mb-6 bg-red-50 rounded-lg shadow-sm border border-red-200">
              <h3 className="text-lg font-medium text-red-600">
                Error: {error}
              </h3>
            </div>
          ) : null}

          {/* Step content */}
          <div className="p-6 mb-8 rounded-lg border border-gray-200 bg-white">
            {renderStep()}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mb-8">
            <div>
              {currentStep > 0 && (
                <button
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Back
                </button>
              )}
            </div>
            <div>
              <button
                className="bg-blue-600 text-white px-8 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={handleNext}
                disabled={loading}
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
