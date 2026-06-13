import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  Dumbbell,
  Plus,
  PlusCircle,
  Save,
  Search,
  Target,
  Trash2,
  X,
} from "lucide-react";
import api from "../api/api.js";

const exerciseCategories = [
  { value: "chest", label: "Chest" },
  { value: "shoulder", label: "Shoulders" },
  { value: "cardio", label: "Cardio" },
  { value: "back", label: "Back" },
  { value: "leg", label: "Legs" },
  { value: "arms", label: "Arms" },
  { value: "core", label: "Core" },
  { value: "olympics", label: "Olympic" },
  { value: "others", label: "Other" },
];

const getCategoryLabel = (category) =>
  exerciseCategories.find((item) => item.value === category)?.label || "Other";

const calculateExerciseVolume = (exercise) =>
  exercise.sets.reduce(
    (total, set) => total + (Number(set.weight) || 0) * (Number(set.reps) || 0),
    0,
  );

const WorkoutLogger = () => {
  const navigate = useNavigate();

  const [workoutName, setWorkoutName] = useState("Workout Session");
  const [duration, setDuration] = useState("");
  const [loggedExercises, setLoggedExercises] = useState([]);
  const [exercisesLibrary, setExercisesLibrary] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customExercise, setCustomExercise] = useState({ name: "", category: "others" });
  const [loading, setLoading] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLibrary = async () => {
      setLibraryLoading(true);

      try {
        const response = await api.get("/exercises");
        const exercises = response.data.exercises || [];

        setExercisesLibrary(exercises);
        if (exercises.length > 0) {
          setSelectedExerciseId(exercises[0]._id);
        }
      } catch (err) {
        console.error("Failed to load exercise library", err);
        setError("Could not load your exercise library.");
      } finally {
        setLibraryLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  const filteredExercises = useMemo(() => {
    const search = exerciseSearch.trim().toLowerCase();

    return exercisesLibrary.filter((exercise) => {
      const matchesSearch = !search || exercise.name.toLowerCase().includes(search);
      const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, exerciseSearch, exercisesLibrary]);

  const activeExerciseId = useMemo(() => {
    if (filteredExercises.length === 0) return "";

    const selectedStillVisible = filteredExercises.some(
      (exercise) => exercise._id === selectedExerciseId,
    );

    return selectedStillVisible ? selectedExerciseId : filteredExercises[0]._id;
  }, [filteredExercises, selectedExerciseId]);

  const sessionStats = useMemo(() => {
    const totalSets = loggedExercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
    const totalVolume = loggedExercises.reduce(
      (sum, exercise) => sum + calculateExerciseVolume(exercise),
      0,
    );

    const rpes = [];
    loggedExercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        if (set.rpe) rpes.push(Number(set.rpe));
      });
    });

    return {
      exercises: loggedExercises.length,
      totalSets,
      totalVolume,
      avgRpe:
        rpes.length > 0
          ? (rpes.reduce((sum, rpe) => sum + rpe, 0) / rpes.length).toFixed(1)
          : "0.0",
    };
  }, [loggedExercises]);

  const handleAddExerciseToWorkout = () => {
    if (!activeExerciseId) {
      setError("Choose an exercise before adding it to the workout.");
      return;
    }

    const alreadyAdded = loggedExercises.some(
      (exercise) => exercise.exerciseId === activeExerciseId,
    );

    if (alreadyAdded) {
      setError("That exercise is already on this workout.");
      return;
    }

    const matched = exercisesLibrary.find((exercise) => exercise._id === activeExerciseId);
    if (!matched) return;

    setLoggedExercises((current) => [
      ...current,
      {
        exerciseId: matched._id,
        name: matched.name,
        category: matched.category || "others",
        sets: [{ weight: "", reps: "", rpe: "", completed: true }],
      },
    ]);
    setError("");
  };

  const handleRemoveExercise = (exerciseIndex) => {
    setLoggedExercises((current) => current.filter((_, index) => index !== exerciseIndex));
  };

  const handleAddSet = (exerciseIndex) => {
    setLoggedExercises((current) =>
      current.map((exercise, index) => {
        if (index !== exerciseIndex) return exercise;

        const lastSet = exercise.sets[exercise.sets.length - 1];
        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            {
              weight: lastSet?.weight || "",
              reps: lastSet?.reps || "",
              rpe: lastSet?.rpe || "",
              completed: true,
            },
          ],
        };
      }),
    );
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    setLoggedExercises((current) =>
      current.flatMap((exercise, index) => {
        if (index !== exerciseIndex) return [exercise];

        const nextSets = exercise.sets.filter((_, currentSetIndex) => currentSetIndex !== setIndex);
        return nextSets.length > 0 ? [{ ...exercise, sets: nextSets }] : [];
      }),
    );
  };

  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    setLoggedExercises((current) =>
      current.map((exercise, index) => {
        if (index !== exerciseIndex) return exercise;

        return {
          ...exercise,
          sets: exercise.sets.map((set, currentSetIndex) =>
            currentSetIndex === setIndex ? { ...set, [field]: value } : set,
          ),
        };
      }),
    );
  };

  const handleCreateCustomExercise = async (event) => {
    event.preventDefault();

    if (!customExercise.name.trim()) {
      setError("Enter a name for the custom exercise.");
      return;
    }

    try {
      const response = await api.post("/exercises", {
        name: customExercise.name.trim(),
        category: customExercise.category,
      });

      const newExercise = response.data.Exercise || response.data.exercise || response.data;

      setExercisesLibrary((current) => [...current, newExercise]);
      setSelectedExerciseId(newExercise._id);
      setExerciseSearch("");
      setCategoryFilter("all");
      setShowAddCustom(false);
      setCustomExercise({ name: "", category: "others" });
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not create that exercise.");
    }
  };

  const handleSubmitWorkout = async (event) => {
    event.preventDefault();

    if (loggedExercises.length === 0) {
      setError("Add at least one exercise before saving the workout.");
      return;
    }

    for (const exercise of loggedExercises) {
      for (const set of exercise.sets) {
        if (set.weight === "" || set.reps === "") {
          setError(`Fill in weight and reps for ${exercise.name}.`);
          return;
        }

        if (set.rpe && (Number(set.rpe) < 1 || Number(set.rpe) > 10)) {
          setError(`RPE for ${exercise.name} must be between 1 and 10.`);
          return;
        }
      }
    }

    const formattedExercises = loggedExercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      sets: exercise.sets.map((set) => ({
        weight: Number(set.weight),
        reps: Number(set.reps),
        rpe: set.rpe ? Number(set.rpe) : null,
        completed: set.completed,
      })),
    }));

    setLoading(true);
    setError("");

    try {
      await api.post("/workouts", {
        name: workoutName.trim() || "Workout Session",
        duration: Number(duration) || 0,
        exercises: formattedExercises,
      });
      navigate("/");
    } catch (err) {
      if (err.response?.data?.error && Array.isArray(err.response.data.error)) {
        setError(err.response.data.error.join(". "));
      } else {
        setError(err.response?.data?.message || "Could not save this workout.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmitWorkout} className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            title="Back to dashboard"
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#dfe5ec] bg-white text-[#445064] transition hover:bg-[#f4f7fa]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="mb-2 text-sm font-medium text-[#0f766e]">Workout logger</p>
            <h1 className="text-3xl font-semibold text-[#14171f] sm:text-4xl">Build today&apos;s session</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687385]">
              Add exercises, capture sets, and save a clean training record.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || loggedExercises.length === 0}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#14171f] px-5 text-sm font-semibold text-white transition hover:bg-[#2b303b] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save workout"}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm font-medium text-[#be123c]">
          {error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="rounded-lg border border-[#dfe5ec] bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-[#0f766e]" />
              <h2 className="text-lg font-semibold text-[#14171f]">Session details</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
              <div>
                <label htmlFor="workoutName" className="mb-2 block text-sm font-medium text-[#445064]">
                  Workout name
                </label>
                <input
                  id="workoutName"
                  type="text"
                  value={workoutName}
                  onChange={(event) => setWorkoutName(event.target.value)}
                  className="h-11 w-full rounded-lg border border-[#dfe5ec] bg-[#f8fafc] px-3 text-sm text-[#14171f] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/15"
                  placeholder="Upper body strength"
                />
              </div>

              <div>
                <label htmlFor="duration" className="mb-2 block text-sm font-medium text-[#445064]">
                  Duration
                </label>
                <div className="relative">
                  <input
                    id="duration"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    className="h-11 w-full rounded-lg border border-[#dfe5ec] bg-[#f8fafc] px-3 pr-12 text-sm text-[#14171f] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/15"
                    placeholder="45"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#687385]">
                    min
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#dfe5ec] bg-white p-5">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#14171f]">Exercise library</h2>
                <p className="mt-1 text-sm text-[#687385]">
                  Search the library or create a movement for this workout.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCustom((current) => !current)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dfe5ec] bg-white px-4 text-sm font-semibold text-[#445064] transition hover:bg-[#f4f7fa]"
              >
                <Plus className="h-4 w-4" />
                New exercise
              </button>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687385]" />
                <input
                  type="search"
                  value={exerciseSearch}
                  onChange={(event) => setExerciseSearch(event.target.value)}
                  className="h-11 w-full rounded-lg border border-[#dfe5ec] bg-[#f8fafc] pl-10 pr-3 text-sm text-[#14171f] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/15"
                  placeholder="Search exercises"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="custom-select h-11 rounded-lg border border-[#dfe5ec] bg-[#f8fafc] px-3 text-sm text-[#14171f] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/15"
              >
                <option value="all">All categories</option>
                {exerciseCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <select
                value={activeExerciseId}
                onChange={(event) => setSelectedExerciseId(event.target.value)}
                disabled={libraryLoading || filteredExercises.length === 0}
                className="custom-select h-11 flex-1 rounded-lg border border-[#dfe5ec] bg-[#f8fafc] px-3 text-sm text-[#14171f] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {libraryLoading ? (
                  <option value="">Loading exercises...</option>
                ) : filteredExercises.length === 0 ? (
                  <option value="">No exercises found</option>
                ) : (
                  filteredExercises.map((exercise) => (
                    <option key={exercise._id} value={exercise._id}>
                      {exercise.name} - {getCategoryLabel(exercise.category)}
                    </option>
                  ))
                )}
              </select>

              <button
                type="button"
                onClick={handleAddExerciseToWorkout}
                disabled={!activeExerciseId}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0f766e] px-5 text-sm font-semibold text-white transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PlusCircle className="h-4 w-4" />
                Add exercise
              </button>
            </div>

            {showAddCustom && (
              <div className="mt-5 border-t border-[#edf1f5] pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#14171f]">Create custom exercise</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(false)}
                    title="Close custom exercise form"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#687385] transition hover:bg-[#f4f7fa] hover:text-[#14171f]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
                  <input
                    type="text"
                    value={customExercise.name}
                    onChange={(event) =>
                      setCustomExercise((current) => ({ ...current, name: event.target.value }))
                    }
                    className="h-10 rounded-lg border border-[#dfe5ec] bg-[#f8fafc] px-3 text-sm text-[#14171f] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/15"
                    placeholder="Exercise name"
                  />
                  <select
                    value={customExercise.category}
                    onChange={(event) =>
                      setCustomExercise((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    className="custom-select h-10 rounded-lg border border-[#dfe5ec] bg-[#f8fafc] px-3 text-sm text-[#14171f] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/15"
                  >
                    {exerciseCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleCreateCustomExercise}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-[#14171f] px-4 text-sm font-semibold text-white transition hover:bg-[#2b303b]"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#14171f]">Workout sheet</h2>
                <p className="mt-1 text-sm text-[#687385]">Enter weight, reps, and optional RPE for each set.</p>
              </div>
            </div>

            {loggedExercises.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#cbd5e1] bg-white p-10 text-center">
                <Dumbbell className="mx-auto mb-3 h-10 w-10 text-[#94a3b8]" />
                <h3 className="text-base font-semibold text-[#14171f]">No exercises added</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#687385]">
                  Pick an exercise from the library to start building the session.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {loggedExercises.map((exercise, exerciseIndex) => (
                  <article key={exercise.exerciseId} className="rounded-lg border border-[#dfe5ec] bg-white p-5">
                    <div className="mb-4 flex flex-col gap-3 border-b border-[#edf1f5] pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-[#14171f]">{exercise.name}</h3>
                        <p className="mt-1 text-sm text-[#687385]">
                          {getCategoryLabel(exercise.category)} - {exercise.sets.length} sets -{" "}
                          {calculateExerciseVolume(exercise).toLocaleString()} kg
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(exerciseIndex)}
                        title={`Remove ${exercise.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#687385] transition hover:bg-[#fff1f2] hover:text-[#be123c]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="hidden grid-cols-[72px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px] gap-3 pb-2 text-xs font-semibold text-[#687385] sm:grid">
                      <span>Set</span>
                      <span>Weight kg</span>
                      <span>Reps</span>
                      <span>RPE</span>
                      <span />
                    </div>

                    <div className="space-y-3">
                      {exercise.sets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          className="grid gap-3 rounded-lg border border-[#edf1f5] bg-[#f8fafc] p-3 sm:grid-cols-[72px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px] sm:border-0 sm:bg-transparent sm:p-0"
                        >
                          <div className="flex items-center justify-between text-sm font-semibold text-[#445064] sm:block sm:pt-2">
                            <span className="sm:hidden">Set</span>
                            <span>{setIndex + 1}</span>
                          </div>

                          <label className="block">
                            <span className="mb-1 block text-xs font-medium text-[#687385] sm:hidden">
                              Weight kg
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              inputMode="decimal"
                              value={set.weight}
                              onChange={(event) =>
                                handleSetChange(exerciseIndex, setIndex, "weight", event.target.value)
                              }
                              className="h-10 w-full rounded-lg border border-[#dfe5ec] bg-white px-3 text-sm text-[#14171f] outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/15"
                              placeholder="60"
                            />
                          </label>

                          <label className="block">
                            <span className="mb-1 block text-xs font-medium text-[#687385] sm:hidden">
                              Reps
                            </span>
                            <input
                              type="number"
                              min="0"
                              inputMode="numeric"
                              value={set.reps}
                              onChange={(event) =>
                                handleSetChange(exerciseIndex, setIndex, "reps", event.target.value)
                              }
                              className="h-10 w-full rounded-lg border border-[#dfe5ec] bg-white px-3 text-sm text-[#14171f] outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/15"
                              placeholder="10"
                            />
                          </label>

                          <label className="block">
                            <span className="mb-1 block text-xs font-medium text-[#687385] sm:hidden">
                              RPE
                            </span>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              inputMode="numeric"
                              value={set.rpe}
                              onChange={(event) =>
                                handleSetChange(exerciseIndex, setIndex, "rpe", event.target.value)
                              }
                              className="h-10 w-full rounded-lg border border-[#dfe5ec] bg-white px-3 text-sm text-[#14171f] outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/15"
                              placeholder="8"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                            title={`Remove set ${setIndex + 1}`}
                            className="flex h-10 w-full items-center justify-center rounded-lg text-[#687385] transition hover:bg-[#fff1f2] hover:text-[#be123c] sm:w-10"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSet(exerciseIndex)}
                      className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#cbd5e1] bg-white text-sm font-semibold text-[#445064] transition hover:border-[#0f766e] hover:text-[#0f766e]"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add set
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-lg border border-[#dfe5ec] bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
              <Target className="h-5 w-5 text-[#0f766e]" />
              <h2 className="text-lg font-semibold text-[#14171f]">Session summary</h2>
            </div>

            <dl className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#edf1f5] pb-3">
                <dt className="text-sm text-[#687385]">Exercises</dt>
                <dd className="text-sm font-semibold text-[#14171f]">{sessionStats.exercises}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-[#edf1f5] pb-3">
                <dt className="text-sm text-[#687385]">Sets</dt>
                <dd className="text-sm font-semibold text-[#14171f]">{sessionStats.totalSets}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-[#edf1f5] pb-3">
                <dt className="text-sm text-[#687385]">Volume</dt>
                <dd className="text-sm font-semibold text-[#14171f]">
                  {sessionStats.totalVolume.toLocaleString()} kg
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-[#687385]">Avg RPE</dt>
                <dd className="text-sm font-semibold text-[#14171f]">{sessionStats.avgRpe}</dd>
              </div>
            </dl>

            <button
              type="submit"
              disabled={loading || loggedExercises.length === 0}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0f766e] px-5 text-sm font-semibold text-white transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save session"}
            </button>
          </section>

          <section className="rounded-lg border border-[#dfe5ec] bg-white p-5">
            <h2 className="text-lg font-semibold text-[#14171f]">Form check</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#687385]">Workout name</span>
                <span className="font-semibold text-[#14171f]">
                  {workoutName.trim() ? "Ready" : "Missing"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#687385]">Exercise count</span>
                <span className="font-semibold text-[#14171f]">
                  {loggedExercises.length > 0 ? "Ready" : "Missing"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#687385]">Duration</span>
                <span className="font-semibold text-[#14171f]">
                  {duration ? `${duration} min` : "Optional"}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
};

export default WorkoutLogger;
