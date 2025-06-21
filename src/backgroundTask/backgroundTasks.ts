// src/backgroundTasks.ts
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { BackgroundFetchResult } from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const BACKGROUND_TASK_NAME = 'medicamento-lembrete-task';

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    const json = await AsyncStorage.getItem('lembretes');
    if (!json) return BackgroundFetchResult.NoData;

    const lembretes = JSON.parse(json);
    const agora = new Date();

    for (const lembrete of lembretes) {
      const dataHora = new Date(lembrete.dataHoraInicio);
      const tipo = lembrete.frequenciaTipo;
      const quantidade = lembrete.frequenciaQuantidade;
      const diasSemana = lembrete.diasSemanaSelecionados;

      const horaAgora = agora.getHours();
      const minutoAgora = agora.getMinutes();

      const hora = dataHora.getHours();
      const minuto = dataHora.getMinutes();

      const mesmoDiaSemana =
        tipo === 'semana' ? diasSemana.includes(agora.getDay()) : true;

      const intervaloHorasOk =
        tipo === 'horas'
          ? (agora.getTime() - dataHora.getTime()) % (quantidade * 3600 * 1000) < 600000 // 10 minutos de tolerância
          : true;

      const diariaOk = tipo === 'diaria' && horaAgora === hora && minutoAgora === minuto;
      const semanalOk = tipo === 'semana' && mesmoDiaSemana && horaAgora === hora && minutoAgora === minuto;
      const horaCerta = diariaOk || semanalOk || (tipo === 'horas' && intervaloHorasOk);

      if (horaCerta) {
        if (Platform.OS === 'android') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '💊 Hora do medicamento!',
            body: `Tome o medicamento: ${lembrete.titulo}`,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { medicamentoId: lembrete.id || null },
          },
          trigger: {
            seconds: 0, 
            channelId: 'medicamentos',
          }
        });
      } else{
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '💊 Hora do medicamento!',
            body: `Tome o medicamento: ${lembrete.titulo}`,
            sound: 'default',
            data: { medicamentoId: lembrete.id || null },
          },
          trigger: null, // Dispara imediatamente
        });
      }
    }
    return BackgroundFetchResult.NewData;
  } 
  } catch (error) {
    return BackgroundFetchResult.Failed;
  }
}
);

export async function iniciarBackgroundFetch() {
  const status = await BackgroundFetch.getStatusAsync();

  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    alert('O background fetch está restrito ou negado. Verifique as configurações do seu dispositivo.');
    return;
  }

  const tasks = await TaskManager.getRegisteredTasksAsync();
  const isAlreadyRegistered = tasks.find(t => t.taskName === BACKGROUND_TASK_NAME);

  if (!isAlreadyRegistered) {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 60 * 15, // a cada 15 minutos, intervalo mínimo possivel
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
}
