import { getTeachersByClass } from "@/lib/repo";


export type BusyBlock = {
  day: string;        // e.g. "Mon"
  start: string;      // "10:00" (HH:MM)
  end: string;        // "11:30"
  location?: string;  // e.g. "Home", "Campus"
};


export type WantedClass = {
  code: string;
  humanName?: string;
  typePrefix?: string | null;
  location?: string | null;
};


export type TransportMode = "walk" | "drive" | "bus";


export type ScheduleRequest = {
  busyBlocks: BusyBlock[];
  wantedClasses: WantedClass[];
  transportMode: TransportMode;
};


export type PlannedClass = {
  code: string;   
  title: string; 
  professor: {
    id: string | null;
    name: string | null;
    avg_rating: number | null;
    avg_difficulty: number | null;
  };
  timeslot: {
    day: string;
    start: string;
    end: string;
    location: string;
  };
};


export type ScheduleResponse = {
  schedules: PlannedClass[][];
};


export async function generateSchedule(
  req: ScheduleRequest
): Promise<ScheduleResponse> {
  const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const result: PlannedClass[] = [];

  for (let i = 0; i < req.wantedClasses.length; i++) {
    const cls = req.wantedClasses[i];
    const day = dayOrder[i % dayOrder.length];


    let bestProf: {
      id: string | null;
      name: string | null;
      avg_rating: number | null;
      avg_difficulty: number | null;
    } = {
      id: null,
      name: null,
      avg_rating: null,
      avg_difficulty: null,
    };

    try {

      const teachers = await getTeachersByClass(cls.code);

      if (teachers && teachers.length > 0) {

        const sorted = [...teachers].sort((a, b) => {
          const ra = a.avg_rating ?? 0;
          const rb = b.avg_rating ?? 0;
          if (rb !== ra) return rb - ra;

          const na = a.num_ratings ?? 0;
          const nb = b.num_ratings ?? 0;
          return nb - na;
        });

        const top = sorted[0];
        bestProf = {
          id: top.id,
          name: top.name,
          avg_rating: top.avg_rating ?? null,
          avg_difficulty: top.avg_difficulty ?? null,
        };
      }
    } catch (err) {
      console.error("Error fetching teachers for class", cls.code, err);
    }


    const title = cls.humanName && cls.humanName.trim().length > 0
      ? cls.humanName.trim()
      : cls.code;

//placeholder
    result.push({
      code: cls.code,
      title,
      professor: bestProf,
      timeslot: {
        day,
        start: "10:00",
        end: "11:15",
        location: "Campus",
      },
    });
  }

  return {
    schedules: [result],
  };
}
