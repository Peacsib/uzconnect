"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X, GraduationCap } from "lucide-react";
import staticProgrammes from "@/data/programmes.json";
import staticDepartments from "@/data/departments.json";
import staticFaculties from "@/data/faculties.json";

interface ProgrammeComboboxProps {
  value?: string | number;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ProgrammeCombobox({
  value,
  onValueChange,
  placeholder = "Select degree programme...",
  disabled = false,
  className = "",
}: ProgrammeComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("All");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build lookup maps for faculties and departments
  const enrichedProgrammes = useMemo(() => {
    const deptMap = new Map(staticDepartments.map((d) => [d.id, d]));
    const facMap = new Map(staticFaculties.map((f) => [f.id, f.name]));

    return staticProgrammes.map((p) => {
      const dept = deptMap.get(p.department_id);
      const facultyName = dept ? facMap.get(dept.faculty_id) : "University of Zimbabwe";
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        department: dept?.name || "",
        faculty: facultyName || "University of Zimbabwe",
      };
    });
  }, []);

  // Distinct faculties for filter pills
  const facultiesList = useMemo(() => {
    const unique = Array.from(new Set(enrichedProgrammes.map((p) => p.faculty))).filter(Boolean);
    return ["All", ...unique];
  }, [enrichedProgrammes]);

  // Find currently selected programme
  const selectedProgramme = useMemo(() => {
    if (!value) return null;
    return enrichedProgrammes.find((p) => String(p.id) === String(value)) || null;
  }, [value, enrichedProgrammes]);

  // Filter programmes based on search and faculty
  const filteredProgrammes = useMemo(() => {
    let list = enrichedProgrammes;

    if (selectedFaculty !== "All") {
      list = list.filter((p) => p.faculty === selectedFaculty);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.faculty.toLowerCase().includes(q)
      );
    }

    return list;
  }, [enrichedProgrammes, selectedFaculty, search]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => inputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (progId: number) => {
    onValueChange(String(progId));
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[44px] px-3.5 py-2 text-left bg-white border rounded-xl flex items-center justify-between gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#003366] ${
          isOpen ? "border-[#003366] ring-2 ring-[#003366]/20" : "border-gray-200 hover:border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer"}`}
      >
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {selectedProgramme ? (
            <div className="flex items-center gap-2 truncate">
              <span className="px-2 py-0.5 rounded-md bg-[#003366] text-white text-[11px] font-mono font-bold shrink-0 shadow-xs">
                {selectedProgramme.code}
              </span>
              <span className="text-xs font-semibold text-gray-900 truncate">
                {selectedProgramme.name}
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400 font-normal flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#003366]" : ""
          }`}
        />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200/90 overflow-hidden flex flex-col max-h-[380px] animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="p-2.5 border-b border-gray-100 bg-gray-50/70">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by code (e.g. HWWMS) or name (e.g. Water)..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] shadow-2xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Faculty Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 scrollbar-none text-[10px]">
              {facultiesList.map((fac) => {
                const isSelected = selectedFaculty === fac;
                const shortLabel = fac === "All" ? "All Faculties" : fac.replace(/^Faculty of\s+/i, "");
                return (
                  <button
                    key={fac}
                    type="button"
                    onClick={() => setSelectedFaculty(fac)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      isSelected
                        ? "bg-[#003366] text-white shadow-xs"
                        : "bg-white text-gray-600 hover:bg-gray-200/70 border border-gray-200"
                    }`}
                  >
                    {shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="px-3 py-1 bg-gray-100/60 border-b border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-medium">
            <span>
              {filteredProgrammes.length} programme{filteredProgrammes.length === 1 ? "" : "s"} found
            </span>
            {selectedProgramme && (
              <span className="text-[#003366] font-semibold">
                Selected: {selectedProgramme.code}
              </span>
            )}
          </div>

          {/* Programmes Scrollable List */}
          <div className="overflow-y-auto divide-y divide-gray-100 flex-1 overscroll-contain">
            {filteredProgrammes.length === 0 ? (
              <div className="p-8 text-center">
                <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-700">No programmes found</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Try searching for a different code or programme name.
                </p>
              </div>
            ) : (
              filteredProgrammes.map((prog) => {
                const isCurrent = String(prog.id) === String(value);
                return (
                  <button
                    key={prog.id}
                    type="button"
                    onClick={() => handleSelect(prog.id)}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                      isCurrent
                        ? "bg-blue-50/80 border-l-4 border-[#003366]"
                        : "hover:bg-gray-50/90 hover:border-l-4 hover:border-[#ff8c00]"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isCurrent
                              ? "bg-[#003366] text-white"
                              : "bg-blue-100 text-[#003366]"
                          }`}
                        >
                          {prog.code}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium truncate">
                          {prog.faculty}
                        </span>
                      </div>
                      <p
                        className={`text-xs leading-snug ${
                          isCurrent ? "font-bold text-[#003366]" : "font-semibold text-gray-900"
                        }`}
                      >
                        {prog.name}
                      </p>
                    </div>

                    {isCurrent && (
                      <div className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
