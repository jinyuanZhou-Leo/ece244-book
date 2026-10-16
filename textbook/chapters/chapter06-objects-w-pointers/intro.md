# Objects with Pointers

In this chapter, we discuss the copy constructor, a special constructor that is called when we create an object from an existing object, including when an object is passed or returned by value. C++ gives every class a default copy constructor and a default `operator=`, unless we define our own. However, we will soon realize that in classes that have pointers to dynamically allocated memory, these defaults make shallow copies, and we need to define the class' own copy constructor, `operator=` and destructor. This guideline is known as the Rule of Three.
