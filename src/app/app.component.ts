import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  public signalButtonLabel: string = "Start";
  public timer = 0;
  public timerLimit = 30;
  public vehiclesAtSignal: Array<string> = [];
  public violatedVehicles: Array<string> = [];
  public penaltyDetails: Array<IPenaltyDetails> = [];
  public serverMessage: string = null;
  public selectedVehicle: string = "";
  public ownerName: string = "";

  constructor(private httpClient: HttpClient) {}

  public signalChange(event) {
    if (this.signalButtonLabel === "Start") {
      this.signalButtonLabel = "Go";
      this.initTimer();
    } else if (this.signalButtonLabel === "Go") {
      this.signalButtonLabel = "Stop";
      this.timer = 0;
      this.getAllVehiclesInTraffic();
    } else if (this.signalButtonLabel === "Stop") {
      this.signalButtonLabel = "Go";
      this.timer = 0;
      this.clearAllVehicles();
    }
  }

  public vehicleSelected(event) {
    this.selectedVehicle = event;
    this.httpClient
      .get<any>(
        `${"http://garudaprasad.pythonanywhere.com"}/penalty-details?vehicleID=${event}`
      )
      .subscribe(
        result => {
          this.penaltyDetails = result["data"];
          this.ownerName = result["owner"];
        },
        error => console.error(error)
      );
  }

  public getSum(val: Array<IPenaltyDetails>) {
    let total = 0;
    for (var i = 0; i < val.length; i++) {
      total += val[i].amount;
    }
    return total;
  }

  private clearAllVehicles() {
    this.vehiclesAtSignal = [];
    this.violatedVehicles = [];
    this.penaltyDetails = [];
    this.serverMessage = null;
    this.selectedVehicle = "";
    this.ownerName = "";
  }

  private getAllVehiclesInTraffic() {
    this.serverMessage = "Loading Vehicles";
    let vehiclesPresent = Math.random() * (20 - 10) + 10;
    let interval = setInterval(() => {
      let val =
        "KA-" +
        Math.floor(10 + Math.random() * 90).toString() +
        "-" +
        Math.floor(1000 + Math.random() * 9000).toString();
      this.vehiclesAtSignal.push(val);
      vehiclesPresent--;
      if (vehiclesPresent <= 0) {
        clearInterval(interval);
        this.serverMessage = "Updating data to server";
        this.uploadVehicleData();
      }
    }, 100);
  }
  private uploadVehicleData() {
    this.httpClient
      .post<any>(
        `${"http://garudaprasad.pythonanywhere.com"}/filter-suspect-vehicles`,
        this.vehiclesAtSignal
      )
      .subscribe(
        result => {
          this.violatedVehicles = result["data"];
          this.serverMessage = "Data sent...!!!";
        },
        error => console.error(error)
      );
  }

  private initTimer() {
    setInterval(() => {
      this.oneSecond();
    }, 1000);
  }

  private oneSecond() {
    if (this.timer == this.timerLimit - 1) {
      this.signalChange({});
    } else {
      this.timer++;
    }
  }
}

export interface IPenaltyDetails {
  description: string;
  amount: number;
}
