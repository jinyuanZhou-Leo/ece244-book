#include <iostream>
#include <string>
using namespace std;

class Student {
  private:
    string name;
    int ID;
  public:
    Student(string n, int id) {
      name = n;
      ID = id;
      cout << "Constructor called for " << name << endl;
    }
    Student(const Student& other) {
      name = other.name;
      ID = other.ID;
      cout << "Copy constructor called for " << name << endl;
    }
    void print() {
      cout << "Name: " << name << ", ID: " << ID << endl;
    }
};

void printStudent(Student s) {
  s.print();
}

Student getCopy(Student& s) {
  return s;
}

int main(void) {
  Student a("Kenya", 8012);
  Student b(a);           // Case 1
  Student c = a;          // Case 2
  printStudent(a);        // Case 3
  Student d = getCopy(a); // Case 4
  return 0;
}
