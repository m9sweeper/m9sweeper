import { Injectable } from "@nestjs/common";
import { Counter } from "prom-client";
import {InjectMetric} from "@willsoto/nestjs-prometheus";


@Injectable()
export class LoginCounterService {
    constructor(@InjectMetric("login_counter") public counter: Counter<any>) {}
}
