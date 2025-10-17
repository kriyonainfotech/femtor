import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { isEqual } from 'lodash';
import { useAuth } from '../../Context/AuthContext';

// Import the new, smaller UI components
import CourseDetailsForm from './CourseDetailsForm';
import LessonList from './LessonList';
import PublishingPanel from './PublishingPanel';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

const CourseForm = ({ course: initialCourse, onSuccess, onStateChange }) => {
    const { user } = useAuth();
    const isEditMode = !!initialCourse?._id;

    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        title: initialCourse?.title || '',
        description: initialCourse?.description || '',
        thumbnailUrl: initialCourse?.thumbnailUrl || '',
        artistId: initialCourse?.artistId?._id || '',
        categoryId: initialCourse?.categoryId?._id || '',
        price: initialCourse?.price || 0,
        certificate: {
            isEnabled: initialCourse?.certificate?.isEnabled || false,
            url: initialCourse?.certificate?.url || '',
        },
    });
    const [lessons, setLessons] = useState(initialCourse?.lessons || []);
    const [loading, setLoading] = useState(false); // For major actions like publishing
    const [isSaving, setIsSaving] = useState(false); // For the subtle auto-save indicator
    const [isDirty, setIsDirty] = useState(false);
    const [lastSavedState, setLastSavedState] = useState(null);

    useEffect(() => {
        const fetchLessons = async () => {
            if (!initialCourse?._id) return;

            try {
                const token = localStorage.getItem("token"); // 👈 get token
                const response = await axios.get(
                    `${API_URL}/api/courses/get-all-lessons/${initialCourse._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // 👈 attach token
                        },
                    }
                );

                // Assuming API returns { data: [...] }
                setLessons(response.data.data || []);
                console.log("Fetched lessons:", response.data.data);
            } catch (error) {
                console.error("Failed to fetch lessons:", error);
            }
        };

        fetchLessons();
    }, [initialCourse?._id]);


    // --- In CourseForm.jsx ---

    // No changes to the refs
    const reconnectTimeout = useRef(null);
    const ws = useRef(null);

    useEffect(() => {
        const userId = user?._id;
        if (!userId) return;

        const connect = () => {
            // This part is already correct
            if (ws.current && ws.current.readyState === WebSocket.OPEN) return;

            console.log("[WebSocket] Attempting to connect...");
            ws.current = new WebSocket(`${WS_URL}?userId=${userId}`);

            ws.current.onopen = () => {
                console.log("[WebSocket] Connection established.");
                if (reconnectTimeout.current) {
                    clearTimeout(reconnectTimeout.current);
                }
            };

            ws.current.onclose = () => {
                console.log("[WebSocket] Connection closed. Attempting to reconnect in 3 seconds...");
                ws.current = null;
                reconnectTimeout.current = setTimeout(connect, 3000);
            };

            ws.current.onerror = (err) => {
                console.error("[WebSocket] Error:", err);
                ws.current.close();
            };

            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log("[WebSocket] Received real-time update:", message);

                    setLessons(prevLessons =>
                        prevLessons.map(lesson => {
                            if (lesson.video?._id === message.videoId) {
                                return { ...lesson, video: { ...lesson.video, ...message } };
                            }
                            return lesson;
                        })
                    );
                } catch (error) {
                    console.error("Failed to parse WebSocket message:", event.data);
                }
            };
        };

        connect();

        // --- THIS IS THE FIX ---
        // The new cleanup function is much simpler. It only cleans up the timer.
        // It leaves the WebSocket instance in the useRef to survive the Strict Mode remount.
        return () => {
            if (reconnectTimeout.current) {
                console.log("[WebSocket Cleanup] Clearing pending reconnect timer.");
                clearTimeout(reconnectTimeout.current);
            }
        };
    }, [user]);
    // Snapshot creation for "dirty" checking
    useEffect(() => {
        const snapshot = { formData: { ...formData }, lessons: [...lessons] };
        setLastSavedState(snapshot);
    }, [initialCourse]);

    // Continuous dirty checking & notifying the parent page
    useEffect(() => {
        if (!lastSavedState) return;
        const currentState = { formData, lessons };
        const dirty = !isEqual(currentState, lastSavedState);
        setIsDirty(dirty);
        // This is the new function that keeps the parent page's header in sync
        onStateChange({ isDirty: dirty, isSaving, title: formData.title });
    }, [formData, lessons, lastSavedState, isSaving]);

    // Debounced auto-saving
    const debounceTimeout = useRef(null);
    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            if (isEditMode && isDirty) handleSaveDraft();
        }, 3000);
        return () => clearTimeout(debounceTimeout.current);
    }, [formData, lessons, isDirty]);

    // --- HANDLER FUNCTIONS (Passed down to children as props) ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith("certificate.")) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, certificate: { ...prev.certificate, [field]: type === 'checkbox' ? checked : value } }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        const lessonIds = lessons.map(lesson => lesson._id);
        const payload = { ...formData, lessons: lessonIds, status: 'Draft' };

        try {
            const response = await axios.put(`${API_URL}/api/courses/${initialCourse._id}`, payload);
            const updatedCourse = response.data.data;
            // Update the "last saved state" snapshot to reset the dirty check
            setLastSavedState({
                formData: {
                    title: updatedCourse.title,
                    description: updatedCourse.description,
                    thumbnailUrl: updatedCourse.thumbnailUrl,
                    artistId: updatedCourse.artistId,
                    categoryId: updatedCourse.categoryId,
                    price: updatedCourse.price,
                    certificate: updatedCourse.certificate
                },
                lessons: updatedCourse.lessons,
            });
        } catch (error) {
            console.error("Failed to save draft:", error);
        } finally {
            setTimeout(() => setIsSaving(false), 1000);
        }
    };

    const handlePublish = async () => {
        if (isDirty) {
            alert("Please save your changes before publishing.");
            return;
        }
        setLoading(true);
        try {
            await axios.put(`${API_URL}/api/courses/${initialCourse._id}/publish`);
            onSuccess(); // Navigate away
        } catch (error) {
            console.error("Failed to publish course:", error);
            alert("Error: Could not publish the course.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <CourseDetailsForm formData={formData} handleChange={handleChange} />
                <LessonList
                    lessons={lessons}
                    setLessons={setLessons}
                    courseId={initialCourse._id}
                />
            </div>
            <div className="lg:col-span-1 space-y-6">
                <PublishingPanel
                    formData={formData}
                    handleChange={handleChange}
                    isDirty={isDirty}
                    isSaving={isSaving}
                    loading={loading}
                    onSaveDraft={handleSaveDraft}
                    onPublish={handlePublish}
                />
            </div>
        </div>
    );
};

export default CourseForm;

