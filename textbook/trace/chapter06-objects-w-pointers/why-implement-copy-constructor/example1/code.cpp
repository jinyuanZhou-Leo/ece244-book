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
  Student y = x; // Default copy constructor
  y.setGrade(0, 70);
  cout << "x: ";
  x.print();
  cout << "y: ";
  y.print();
  return 0;
}
