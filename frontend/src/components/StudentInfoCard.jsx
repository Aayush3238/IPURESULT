import { Building2, GraduationCap, Hash, UserRound, Calendar, Mail, Phone, Heart } from "lucide-react";

const infoItems = [
  { key: "name", label: "Student Name", icon: UserRound },
  { key: "enrollmentNumber", label: "Enrollment Number", icon: Hash },
  { key: "collegeName", label: "College Name", icon: Building2 },
  { key: "course", label: "Course", icon: GraduationCap },
];

const extraInfoItems = [
  { key: "fatherName", label: "Father's Name", icon: UserRound },
  { key: "motherName", label: "Mother's Name", icon: Heart },
  { key: "gender", label: "Gender", icon: UserRound },
  { key: "admissionYear", label: "Admission Year", icon: Calendar },
  { key: "batch", label: "Batch", icon: Calendar },
  { key: "email", label: "Email Address", icon: Mail },
  { key: "contactNumber", label: "Contact Number", icon: Phone },
];

export default function StudentInfoCard({ student }) {
  const hasExtraInfo = student.fatherName || student.email || student.contactNumber;

  return (
    <section className="glass rounded-2xl p-4 sm:p-6 shadow-card">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-cyan/20 text-accent-light sm:h-14 sm:w-14">
            <UserRound className="h-5 w-5 sm:h-7 sm:w-7" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-white sm:text-lg">
              Student Information
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-navy-300 sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Semester {String(student.semester || "").replace(/semester/i, "").trim()} academic record
            </div>
          </div>
        </div>
        <span className="w-fit rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-bold text-success-light">
          Verified Result
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
        {infoItems.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="rounded-xl border border-navy-600/50 bg-navy-800/30 p-3 transition hover:border-navy-600 hover:bg-navy-800/50 sm:p-4"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-navy-400 sm:gap-2 sm:text-xs">
              <Icon className="h-3.5 w-3.5 text-accent-light sm:h-4 sm:w-4" />
              {label}
            </div>
            <p className="mt-1.5 text-xs font-semibold leading-5 text-white sm:mt-2 sm:text-sm sm:leading-6">
              {student[key] || "N/A"}
            </p>
          </div>
        ))}
      </div>

      {hasExtraInfo && (
        <div className="mt-6 border-t border-navy-600/40 pt-5 space-y-4">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-cyan-light">
            Additional Profile Details
          </h3>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            {extraInfoItems
              .filter(({ key }) => student[key])
              .map(({ key, label, icon: Icon }) => (
                <div key={key} className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 block">
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-800/50 border border-navy-700/50 text-navy-300">
                      <Icon className="h-4 w-4 text-cyan-light" />
                    </div>
                    <p className="font-semibold text-xs text-white truncate max-w-[150px] sm:max-w-none" title={student[key]}>
                      {student[key]}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
