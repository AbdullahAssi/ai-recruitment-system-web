import {
  getScoreColor,
  getStatusBadgeColor,
  formatJobPostedDate,
  truncateText,
} from "./jobUtils";

describe("jobUtils", () => {
  describe("getScoreColor", () => {
    it("should return green classes for score >= 80", () => {
      expect(getScoreColor(80)).toBe("text-green-600 bg-green-100");
      expect(getScoreColor(95)).toBe("text-green-600 bg-green-100");
    });

    it("should return yellow classes for score >= 60 and < 80", () => {
      expect(getScoreColor(60)).toBe("text-yellow-600 bg-yellow-100");
      expect(getScoreColor(79)).toBe("text-yellow-600 bg-yellow-100");
    });

    it("should return red classes for score < 60", () => {
      expect(getScoreColor(59)).toBe("text-red-600 bg-red-100");
      expect(getScoreColor(0)).toBe("text-red-600 bg-red-100");
    });
  });

  describe("getStatusBadgeColor", () => {
    it("should return active color when isActive is true", () => {
      expect(getStatusBadgeColor(true)).toBe("bg-green-100 text-green-800");
    });

    it("should return inactive color when isActive is false", () => {
      expect(getStatusBadgeColor(false)).toBe("bg-gray-100 text-gray-800");
    });
  });

  describe("formatJobPostedDate", () => {
    it("should format date correctly", () => {
      const date = "2023-01-15T10:00:00Z";
      const formatted = formatJobPostedDate(date);
      // Allow date shift due to timezone differences
      expect(formatted).toMatch(/Jan (14|15|16), 2023/);
    });

     it("should format another date correctly", () => {
        const date = "2023-12-31";
        const formatted = formatJobPostedDate(date);
        // Allow date shift due to timezone differences
        expect(formatted).toMatch(/(Dec (30|31)|Jan 01), (2023|2024)/);
     })
  });

  describe("truncateText", () => {
    it("should not truncate if text is shorter than maxLength", () => {
      const text = "Hello world";
      expect(truncateText(text, 20)).toBe("Hello world");
    });

    it("should not truncate if text is equal to maxLength", () => {
      const text = "Hello world";
      expect(truncateText(text, 11)).toBe("Hello world");
    });

    it("should truncate and append ... if text is longer than maxLength", () => {
      const text = "Hello world, this is a long text";
      expect(truncateText(text, 11)).toBe("Hello world...");
    });
  });
});
