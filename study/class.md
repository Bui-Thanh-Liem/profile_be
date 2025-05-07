# class
class Car {
  constructor(name, color) {
    this.name = name;
  }

  run() {
    console.log(`Car ${this.name} va ${this.color} running...`);
  }
  static hello() {
    console.log("Hello");
  }
}

const honda = new Car("A", "red");

# static chỉ được gọi thông qua CLASS , không thể gọi từ instance
honda.run();
Car.hello();

# Abstract class  => chỉ làm khuôn mẫu cho các class khác kế thừa 
# Abstract method => không có phần thân, trong các class kế thừa sẽ có
