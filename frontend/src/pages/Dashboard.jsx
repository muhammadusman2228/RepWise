import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Plus,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { AuthContext } from "../context/auth-context.js";
import api from "../api/api.js";

const categoryMeta = {
  chest: { label: "Chest", color: "#0f766e" },
  shoulder: { label: "Shoulders", color: "#2563eb" },
  cardio: { label: "Cardio", color: "#dc2626" },
  back: { label: "Back", color: "#7c3aed" },
  leg: { label: "Legs", color: "#d97706" },
  arms: { label: "Arms", color: "#db2777" },
  core: { label: "Core", color: "#0891b2" },
  olympics: { label: "Olympic", color: "#4f46e5" },
  others: { label: "Other", color: "#64748b" },
};

const metricTone = {
  teal: "border-[#bfe7df] bg-[#eefaf7] text-[#0f766e]",
  blue: "border-[#c7dcff] bg-[#eff6ff] text-[#1d4ed8]",
  amber: "border-[#fde68a] bg-[#fffbeb] text-[#b45309]",
  rose: "border-[#fecdd3] bg-[#fff1f2] text-[#be123c]",
};

const formatNumber = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const toDate = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const toDayKey = (value) => {
  const date = toDate(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (value) =>
  toDate(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatShortDate = (value) =>
  toDate(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const getWorkoutDate = (workout) => workout.date || workout.createdAt || workout.updatedAt;

const getSetCount = (workout) =>
  workout.exercises?.reduce((sum, exercise) => sum + (exercise.sets?.length || 0), 0) || 0;

const getWorkoutVolume = (workout) =>
  workout.exercises?.reduce((exerciseTotal, exercise) => {
    const setVolume =
      exercise.sets?.reduce(
        (setTotal, set) =>
          setTotal + (Number(set.weight) || 0) * (Number(set.reps) || 0),
        0,
      ) || 0;

    return exerciseTotal + setVolume;
  }, 0) || 0;

const inferCategory = (name = "") => {
  const value = name.toLowerCase();

  if (/(run|bike|row|cardio|walk|sprint|jump)/.test(value)) return "cardio";
  if (/(bench|press|fly|chest|push)/.test(value)) return "chest";
  if (/(squat|deadlift|lunge|leg|calf|hamstring)/.test(value)) return "leg";
  if (/(row|lat|pull|back)/.test(value)) return "back";
  if (/(curl|tricep|bicep|arm)/.test(value)) return "arms";
  if (/(plank|core|abs|crunch)/.test(value)) return "core";
  if (/(snatch|clean|jerk)/.test(value)) return "olympics";
  if (/(shoulder|raise|lateral)/.test(value)) return "shoulder";

  return "others";
};

const getLastDays = (count) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - 1 - index));
    return date;
  });
};

const buildStreak = (workouts) => {
  const activeDays = new Set(workouts.map((workout) => toDayKey(getWorkoutDate(workout))));
  if (activeDays.size === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  if (!activeDays.has(toDayKey(start))) {
    start.setDate(start.getDate() - 1);
  }

  let streak = 0;
  const cursor = new Date(start);

  while (activeDays.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const MetricCard = ({ icon, label, value, detail, tone }) => (
  <section className={`rounded-lg border p-4 ${metricTone[tone]}`}>
    <div className="mb-5 flex items-center justify-between">
      <span className="text-sm font-medium text-[#445064]">{label}</span>
      {icon}
    </div>
    <p className="text-2xl font-semibold text-[#14171f]">{value}</p>
    <p className="mt-1 text-xs text-[#687385]">{detail}</p>
  </section>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      const [workoutsResult, exercisesResult] = await Promise.allSettled([
        api.get("/workouts"),
        api.get("/exercises"),
      ]);

      if (workoutsResult.status === "fulfilled") {
        const payload = workoutsResult.value.data;
        setWorkouts(payload.workouts || payload || []);
      } else {
        setError("Could not load your workout history.");
      }

      if (exercisesResult.status === "fulfilled") {
        const payload = exercisesResult.value.data;
        setExerciseLibrary(payload.exercises || []);
      }

      setLoading(false);
    };

    fetchDashboard();
  }, []);

  const exerciseCategoryMap = useMemo(() => {
    const map = new Map();
    exerciseLibrary.forEach((exercise) => {
      map.set(String(exercise._id), exercise.category || "others");
    });
    return map;
  }, [exerciseLibrary]);

  const sortedWorkouts = useMemo(
    () =>
      [...workouts].sort(
        (a, b) => toDate(getWorkoutDate(b)).getTime() - toDate(getWorkoutDate(a)).getTime(),
      ),
    [workouts],
  );

  const stats = useMemo(() => {
    const totalWorkouts = workouts.length;
    const totalSets = workouts.reduce((sum, workout) => sum + getSetCount(workout), 0);
    const totalVolume = workouts.reduce((sum, workout) => sum + getWorkoutVolume(workout), 0);
    const totalDuration = workouts.reduce(
      (sum, workout) => sum + (Number(workout.duration) || 0),
      0,
    );

    const rpes = [];
    workouts.forEach((workout) => {
      workout.exercises?.forEach((exercise) => {
        exercise.sets?.forEach((set) => {
          if (set.rpe) rpes.push(Number(set.rpe));
        });
      });
    });

    const avgRpe =
      rpes.length > 0
        ? (rpes.reduce((sum, rpe) => sum + rpe, 0) / rpes.length).toFixed(1)
        : "0.0";

    return {
      totalWorkouts,
      totalSets,
      totalVolume,
      totalDuration,
      avgRpe,
      streak: buildStreak(workouts),
      averageVolume: totalWorkouts > 0 ? totalVolume / totalWorkouts : 0,
    };
  }, [workouts]);

  const weeklyLoad = useMemo(() => {
    const days = getLastDays(7).map((date) => ({
      date,
      key: toDayKey(date),
      sessions: 0,
      volume: 0,
    }));

    const dayMap = new Map(days.map((day) => [day.key, day]));

    workouts.forEach((workout) => {
      const day = dayMap.get(toDayKey(getWorkoutDate(workout)));
      if (!day) return;

      day.sessions += 1;
      day.volume += getWorkoutVolume(workout);
    });

    const maxVolume = Math.max(...days.map((day) => day.volume), 1);

    return days.map((day) => ({
      ...day,
      height: day.sessions > 0 ? Math.max(18, Math.round((day.volume / maxVolume) * 96)) : 8,
    }));
  }, [workouts]);

  const categoryChart = useMemo(() => {
    const counts = new Map();

    workouts.forEach((workout) => {
      workout.exercises?.forEach((exercise) => {
        const exerciseId = String(exercise.exerciseId?._id || exercise.exerciseId || "");
        const category = exerciseCategoryMap.get(exerciseId) || inferCategory(exercise.name);
        counts.set(category, (counts.get(category) || 0) + 1);
      });
    });

    const items = [...counts.entries()]
      .map(([category, count]) => ({
        key: category,
        label: categoryMeta[category]?.label || "Other",
        color: categoryMeta[category]?.color || categoryMeta.others.color,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const total = items.reduce((sum, item) => sum + item.count, 0);
    let cursor = 0;

    const gradient = items
      .map((item) => {
        const start = cursor;
        const end = cursor + (item.count / Math.max(total, 1)) * 100;
        cursor = end;
        return `${item.color} ${start}% ${end}%`;
      })
      .join(", ");

    return {
      items,
      total,
      style: {
        background: total > 0 ? `conic-gradient(${gradient})` : "#e5e7eb",
      },
    };
  }, [exerciseCategoryMap, workouts]);

  const trend = useMemo(() => {
    const points = [...workouts]
      .sort((a, b) => toDate(getWorkoutDate(a)).getTime() - toDate(getWorkoutDate(b)).getTime())
      .slice(-8)
      .map((workout) => ({
        date: getWorkoutDate(workout),
        volume: getWorkoutVolume(workout),
      }));

    if (points.length === 0) return { points, line: "", area: "", min: 0, max: 0 };

    const values = points.map((point) => point.volume);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const span = Math.max(max - min, 1);
    const lastIndex = Math.max(points.length - 1, 1);

    const linePoints = points
      .map((point, index) => {
        const x = points.length === 1 ? 50 : (index / lastIndex) * 100;
        const y = 90 - ((point.volume - min) / span) * 70;
        return `${x},${y}`;
      })
      .join(" ");

    return {
      points,
      line: linePoints,
      area: points.length > 1 ? `0,100 ${linePoints} 100,100` : "",
      min,
      max,
    };
  }, [workouts]);

  const firstName = user?.name?.split(" ")[0] || "there";
  const latestWorkout = sortedWorkouts[0];

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[#0f766e]">Training overview</p>
          <h1 className="text-3xl font-semibold text-[#14171f] sm:text-4xl">
            Good to see you, {firstName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687385]">
            Your recent workouts, volume, effort, and consistency are all in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 items-center gap-2 rounded-lg border border-[#dfe5ec] bg-white px-3 text-sm text-[#445064]">
            <CalendarDays className="h-4 w-4 text-[#0f766e]" />
            {new Date().toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
          <Link
            to="/workout/log"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#14171f] px-4 text-sm font-semibold text-white transition hover:bg-[#2b303b]"
          >
            <Plus className="h-4 w-4" />
            Log workout
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm font-medium text-[#be123c]">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Dumbbell className="h-5 w-5" />}
          label="Workouts"
          value={formatNumber.format(stats.totalWorkouts)}
          detail={`${stats.totalSets} sets logged`}
          tone="teal"
        />
        <MetricCard
          icon={<Flame className="h-5 w-5" />}
          label="Training volume"
          value={`${compactNumber.format(stats.totalVolume)} kg`}
          detail={`${compactNumber.format(stats.averageVolume)} kg average`}
          tone="rose"
        />
        <MetricCard
          icon={<Clock3 className="h-5 w-5" />}
          label="Logged time"
          value={`${formatNumber.format(stats.totalDuration)} min`}
          detail="From saved workout duration"
          tone="blue"
        />
        <MetricCard
          icon={<Target className="h-5 w-5" />}
          label="Average effort"
          value={`${stats.avgRpe} RPE`}
          detail={`${stats.streak} day current streak`}
          tone="amber"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="rounded-lg border border-[#dfe5ec] bg-white p-5">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#14171f]">Weekly training load</h2>
                <p className="text-sm text-[#687385]">Volume by day across the last 7 days.</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#0f766e]">
                <Activity className="h-4 w-4" />
                {weeklyLoad.reduce((sum, day) => sum + day.sessions, 0)} sessions
              </div>
            </div>

            <div className="grid h-52 grid-cols-7 items-end gap-2 sm:gap-4" aria-label="Weekly volume chart">
              {weeklyLoad.map((day) => (
                <div key={day.key} className="flex h-full flex-col justify-end gap-2">
                  <div className="flex flex-1 items-end">
                    <div
                      className={`w-full rounded-t-lg transition ${
                        day.sessions > 0 ? "bg-[#0f766e]" : "bg-[#e8edf2]"
                      }`}
                      style={{ height: `${day.height}%` }}
                      title={`${formatShortDate(day.date)}: ${formatNumber.format(day.volume)} kg`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-[#445064]">
                      {day.date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3)}
                    </p>
                    <p className="text-[11px] text-[#687385]">{compactNumber.format(day.volume)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#dfe5ec] bg-white p-5">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#14171f]">Volume trend</h2>
                <p className="text-sm text-[#687385]">Your last logged sessions by total lifted load.</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#1d4ed8]">
                <TrendingUp className="h-4 w-4" />
                {compactNumber.format(trend.max)} kg peak
              </div>
            </div>

            <div className="h-64 rounded-lg bg-[#f8fafc] p-4">
              {trend.points.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#687385]">
                  Log a workout to build your trend.
                </div>
              ) : (
                <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="Workout volume trend">
                  <defs>
                    <linearGradient id="volumeFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="90" x2="100" y2="90" stroke="#dfe5ec" strokeWidth="0.8" />
                  <line x1="0" y1="55" x2="100" y2="55" stroke="#edf1f5" strokeWidth="0.8" />
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#edf1f5" strokeWidth="0.8" />
                  {trend.area && <polygon points={trend.area} fill="url(#volumeFill)" />}
                  {trend.points.length > 1 ? (
                    <polyline
                      points={trend.line}
                      fill="none"
                      stroke="#0f766e"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                    />
                  ) : (
                    <circle cx="50" cy="55" r="3" fill="#0f766e" />
                  )}
                  {trend.line.split(" ").map((point, index) => {
                    const [x, y] = point.split(",");
                    return <circle key={`${point}-${index}`} cx={x} cy={y} r="2.2" fill="#0f766e" />;
                  })}
                </svg>
              )}
            </div>

            {trend.points.length > 0 && (
              <div className="mt-3 flex justify-between text-xs text-[#687385]">
                <span>{formatShortDate(trend.points[0].date)}</span>
                <span>{formatShortDate(trend.points[trend.points.length - 1].date)}</span>
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#14171f]">Recent workouts</h2>
                <p className="text-sm text-[#687385]">A quick look at your latest logged sessions.</p>
              </div>
              <Link
                to="/workout/log"
                className="hidden items-center gap-1 text-sm font-semibold text-[#0f766e] transition hover:text-[#115e59] sm:flex"
              >
                Add session
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="rounded-lg border border-[#dfe5ec] bg-white p-8 text-center text-sm text-[#687385]">
                Loading workout history...
              </div>
            ) : sortedWorkouts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#cbd5e1] bg-white p-8 text-center">
                <Dumbbell className="mx-auto mb-3 h-9 w-9 text-[#94a3b8]" />
                <h3 className="text-base font-semibold text-[#14171f]">No workouts yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#687385]">
                  Start with one session. The dashboard will fill in your statistics as you log sets.
                </p>
                <Link
                  to="/workout/log"
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#14171f] px-4 text-sm font-semibold text-white transition hover:bg-[#2b303b]"
                >
                  <Plus className="h-4 w-4" />
                  Log first workout
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {sortedWorkouts.slice(0, 6).map((workout) => {
                  const volume = getWorkoutVolume(workout);
                  const sets = getSetCount(workout);

                  return (
                    <article key={workout._id} className="rounded-lg border border-[#dfe5ec] bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-[#14171f]">
                            {workout.name || "Workout session"}
                          </h3>
                          <p className="mt-1 text-sm text-[#687385]">{formatDate(getWorkoutDate(workout))}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-medium text-[#445064]">
                          <span className="rounded-md bg-[#eefaf7] px-2 py-1 text-[#0f766e]">
                            {compactNumber.format(volume)} kg
                          </span>
                          <span className="rounded-md bg-[#eff6ff] px-2 py-1 text-[#1d4ed8]">
                            {sets} sets
                          </span>
                          <span className="rounded-md bg-[#fffbeb] px-2 py-1 text-[#b45309]">
                            {workout.duration || 0} min
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {workout.exercises?.slice(0, 4).map((exercise, index) => (
                          <div key={exercise._id || `${exercise.name}-${index}`} className="flex items-center justify-between border-t border-[#edf1f5] pt-2 text-sm">
                            <span className="min-w-0 truncate pr-3 font-medium text-[#445064]">
                              {exercise.name}
                            </span>
                            <span className="shrink-0 text-xs text-[#687385]">
                              {exercise.sets?.length || 0} sets
                            </span>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-[#dfe5ec] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#14171f]">Category mix</h2>
                <p className="text-sm text-[#687385]">Exercise focus by logged movements.</p>
              </div>
              <Trophy className="h-5 w-5 text-[#d97706]" />
            </div>

            <div className="mt-6 flex items-center gap-5">
              <div className="relative h-36 w-36 shrink-0 rounded-full" style={categoryChart.style}>
                <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white text-center">
                  <span className="text-2xl font-semibold text-[#14171f]">{categoryChart.total}</span>
                  <span className="text-xs text-[#687385]">moves</span>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                {categoryChart.items.length === 0 ? (
                  <p className="text-sm leading-6 text-[#687385]">
                    Categories will appear after you log exercises.
                  </p>
                ) : (
                  categoryChart.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2 text-[#445064]">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="font-semibold text-[#14171f]">
                        {Math.round((item.count / categoryChart.total) * 100)}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#dfe5ec] bg-white p-5">
            <div className="flex items-center gap-3 border-b border-[#edf1f5] pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#eff6ff] text-base font-semibold text-[#1d4ed8]">
                {(user?.name?.[0] || "A").toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-[#14171f]">
                  {user?.name || "Athlete profile"}
                </h2>
                <p className="truncate text-sm text-[#687385]">{user?.email || "Workout account"}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-[#445064]">Weekly sessions</span>
                  <span className="font-semibold text-[#14171f]">
                    {weeklyLoad.reduce((sum, day) => sum + day.sessions, 0)} / 4
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#edf1f5]">
                  <div
                    className="h-2 rounded-full bg-[#0f766e]"
                    style={{
                      width: `${Math.min(
                        (weeklyLoad.reduce((sum, day) => sum + day.sessions, 0) / 4) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-[#445064]">Average intensity</span>
                  <span className="font-semibold text-[#14171f]">{stats.avgRpe} / 10</span>
                </div>
                <div className="h-2 rounded-full bg-[#edf1f5]">
                  <div
                    className="h-2 rounded-full bg-[#d97706]"
                    style={{ width: `${Math.min((Number(stats.avgRpe) / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#dfe5ec] bg-white p-5">
            <h2 className="text-lg font-semibold text-[#14171f]">Next best action</h2>
            <p className="mt-2 text-sm leading-6 text-[#687385]">
              {latestWorkout
                ? `Your last session was ${formatShortDate(getWorkoutDate(latestWorkout))}. Keep the rhythm with a focused workout today.`
                : "Log your first session to unlock useful training recommendations."}
            </p>
            <Link
              to="/workout/log"
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0f766e] px-4 text-sm font-semibold text-white transition hover:bg-[#115e59]"
            >
              <Plus className="h-4 w-4" />
              Open workout logger
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
