#include <iostream>
using namespace std;

class Student {
  private:
    int* grades;
    int numGrades;
  public:
    Student(int n) {
      numGrades = n;
      grades = new int[numGrades];
      for (int i = 0; i < numGrades; i++) {
        grades[i] = 0;
      }
    }
    Student(const Student& other) {
      numGrades = other.numGrades;
      grades = new int[numGrades];
      for (int i = 0; i < numGrades; i++) {
        grades[i] = other.grades[i];
      }
    }
    Student& operator=(const Student& rhs) {
      if (this == &rhs) {
        return *this;
      }
      delete[] grades;
      numGrades = rhs.numGrades;
      grades = new int[numGrades];
      for (int i = 0; i < numGrades; i++) {
        grades[i] = rhs.grades[i];
      }
      return *this;
    }
    ~Student() {
      delete[] grades;
    }
    void setGrade(int index, int grade) {
      grades[index] = grade;
    }
    void print() {
      for (int i = 0; i < numGrades; i++) {
        cout << grades[i] << " ";
      }
      cout << endl;
    }
};

int main(void) {
  Student x(3);
  x.setGrade(0, 90);
  Student y(2);
  y = x; // Our operator=
  y.setGrade(0, 70);
  cout << "x: ";
  x.print();
  cout << "y: ";
  y.print();
  return 0;
}
