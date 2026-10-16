// Shared Student source shown in the Chapter 6 figures.

export const studentClass = (extraMembers) => `
class Student {
  private:
    int* grades;
    int numGrades;
  public:
    Student(int n) {
      numGrades = n;
      grades = new int[numGrades];
      // ... set all grades to 0
    }
${extraMembers}
    ~Student() {
      delete[] grades;
    }
};`;

export const copyCtor = `    Student(const Student& other) {
      numGrades = other.numGrades;
      grades = new int[numGrades];
      // ... copy each grade
    }`;

export const assignOp = `    Student& operator=(const Student& rhs) {
      if (this == &rhs) {
        return *this;
      }
      delete[] grades;
      numGrades = rhs.numGrades;
      grades = new int[numGrades];
      // ... copy each grade
      return *this;
    }`;
